const models = require('./mongoosestructures.js')
// const mongoose = require('mongoose')
const globalinfo = require('./globalinfo.js')
const Product = models[0]
const fs = require('fs')
//  const { SessionHandler } = require('./session.js')

function packetChecking (packet, next) {
  packet[0] = escape(packet[0])
  if (packet[1]) {
    for (const elem of Object.keys(packet[1])) {
      if (elem === 'name') {
        packet[1][elem] = escape(packet[1][elem])
      } else if (!/^[0-9]+$/.test(packet[1][elem])) {
        packet[1][elem] = 0
      }
    }
  }
  next()
}

function getFileName (name) {
  const types = ['.jpg', '.png', '.jpeg', '.bmp']
  for (const type of types) {
    if (fs.existsSync('public/productPictures/' + name + type)) {
      return (process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://vincentroche-nodeproject-9.glitch.me/') + 'productPictures/' + name + type
    }
  }
  return -1
}

function pause () {
  return new Promise(resolve => {
    setTimeout(resolve, 5000)
  })
}

class GamesHandler {
  constructor (io, sessionHandler) {
    /** @member {Array<Game>} */
    this.pendingGames = {}
    this.sessionHandler = sessionHandler
    console.log("HANDLER", this.sessionHandler)
    this.io = io
    this.addEvents()
  }

  /**
   * Adds basic events for each socket
   * Triggered at socket connection
   *
   */
  addEvents () {
    const games = this.pendingGames
    const self = this
    this.io.on('connection', function (socket) {
      console.log(`Socket connected with session ${socket.handshake.query.sessionId}`)
      socket.use(packetChecking)
      socket.on('joinGame', function (message) {
        const game = games[message.gameNumber]
        if (game && !game.started) {
          if (!games[message.gameNumber].addPlayer(new Player(socket))) {
            this.emit('errorGameFull')
          } else {
            this.emit('gameJoined')
            game.sendAll('players', game.getPlayers())
            this.emit('settingsUpdated', game.getSettings())
            console.log('Player', self.sessionHandler.getUsername(this.handshake.query.sessionId), 'joined game n°', message.gameNumber)
          }
        } else if (!game) {
          this.emit('errorNotExist')
        } else if (game.started) {
          this.emit('errorAlreadyStarted')
        }
      })
      socket.on('hostGame', function () {
        const newGame = self.getHostNumber(socket, self)
        console.log('newgame', newGame)
        games[newGame].addPlayer(new Player(socket))
        this.emit('gameNumber', { gameNumber: newGame })
        this.emit('players', games[newGame].getPlayers())
      })
    })
  }

  getHostNumber (hostSocket, self) {
    let newGame = Math.floor(Math.random() * 3000)
    if (Object.keys(self.pendingGames).includes(newGame)) {
      newGame = null
    } else {
      console.log(self)
      self.pendingGames[newGame] = new Game(hostSocket, self.sessionHandler)
    }
    return newGame || self.getHostNumber()
  }
}

class Game {
  constructor (hostSocket, sessionHandler) {
    this.players = []
    this.maxPlayers = 30
    this.nbRounds = 5
    this.roundDuration = 10
    this.started = false
    this.hostSocket = hostSocket
    this.sessionHandler = sessionHandler
    console.log(sessionHandler)
    const self = this
    this.hostSocket.on('GameStart', function () {
      console.log('startGame')
      self.startGame()
    })
    this.hostSocket.on('settingsUpdate', function (settings) {
      self.updateSettings(settings)
    })
  }

  addPlayer (player) {
    if (this.players.length + 1 > this.maxPlayers) {
      return false
    }
    const self = this
    // impromptuous disconnection
    player.socket.on('disconnect', function () {
      self.removePlayer(player)
    })
    // wanted disconnection
    player.socket.on('leaveGame', function () {
      self.removePlayer(player)
    })
    this.players.push(player)
    return true
  }

  removePlayer (player) {
    this.players = this.players.filter(e => e.socket.handshake.query.sessionId !== player.socket.handshake.query.sessionId)
    const name = globalinfo[2][player.socket.handshake.query.sessionId]
    player.socket.removeAllListeners().disconnect()
    console.log(`Player ${name} disconnected`)
  }

  updateSettings (settings) {
    this.maxPlayers = settings.maxPlayers ? settings.maxPlayers : this.maxPlayers
    this.nbRounds = settings.rounds ? settings.rounds : this.nbRounds
    this.roundDuration = settings.roundDuration ? settings.roundDuration : this.roundDuration
    this.sendAll('settingsUpdated', settings)
  }

  getSettings () {
    return {
      maxPlayers: this.maxPlayers,
      rounds: this.nbRounds,
      roundDuration: this.roundDuration
    }
  }

  getPlayers () {
    const toReturn = []
    for (const player of this.players) {
      toReturn.push(this.sessionHandler.getUsername(player.socket.handshake.query.sessionId))
    }
    return toReturn
  }

  sendAll (messageType, messageContent = {}) {
    for (const player of this.players) {
      player.socket.emit(messageType, messageContent)
    }
  }

  inArray (randomProducts, product) {
    for (let i = 0; i < randomProducts.length; i++) {
      if (randomProducts[i].name === product.name) return true
    }
    return false
  }

  async getRandomProducts (nbRounds) {
    const randomProducts = []
    const numberOfProducts = await Product.estimatedDocumentCount()
    for (let i = 0; i < nbRounds; i++) {
      const random = Math.floor(Math.random() * numberOfProducts)
      const product = await Product.findOne().skip(random)
      if (!this.inArray(randomProducts, product)) randomProducts.push(product)
      else i--
    }
    return randomProducts
  }

  async startGame () {
    this.started = true
    const products = await this.getRandomProducts(this.nbRounds)
    this.sendAll('GameStart', { settings: this.getSettings(), players: this.getPlayers() })
    const roundClock = new Clock(this.players, this.roundDuration)
    for (let round = 1; round <= this.nbRounds; round++) {
      const currProd = products[round - 1]
      await this.startRound({ round: round, name: currProd.name, image: getFileName(currProd._id), price: currProd.price }, roundClock)
      await pause()
    }
    this.sendAll('GameEnd')
    this.players = []
    this.started = false
  }

  async startRound (object, clock) {
    const readyPlayers = []
    const answerPromises = []
    for (const player of this.players) {
      player.socket.emit('RoundStart', { name: object.name, image: object.image, round: object.round })
      readyPlayers.push(this.readySignal(player))
      answerPromises.push(this.answerSignal(player))
    }
    clock.start()
    await Promise.all(readyPlayers)
    this.score(await this.compareAnswers(answerPromises, clock, object.price), object.price)
  }

  generateScoreBoard () {
    const scoreBoard = []
    for (const player of this.players) {
      scoreBoard.push({ name: this.sessionHandler.getUsername(player.socket.handshake.query.sessionId), score: player.score })
    }
    scoreBoard.sort((a, b) => a.score - b.score).reverse()
    return scoreBoard
  }

  whiteListAnswers (answers, context) {
    const whiteList = []
    for (const ans of answers) {
      whiteList.push({
        name: context.sessionHandler.getUsername(ans.player.socket.handshake.query.sessionId),
        answer: ans.mess
      })
    }
    return whiteList
  }

  score (answers, price) {
    let score = answers.length
    for (const answer of answers) {
      if (answer.mess > 0) {
        answer.player.score += score
        score--
      }
    }
    const scoreboard = {}
    scoreboard.newScore = this.generateScoreBoard()
    scoreboard.lastAnswers = this.whiteListAnswers(answers, this)
    scoreboard.price = price
    console.log(scoreboard)
    this.sendAll('score', scoreboard)
  }

  async compareAnswers (answerPromises, clock, price) {
    return new Promise(async (resolve, reject) => {
      let results = await Promise.all(answerPromises)
      //  console.log('res', results)
      clock.stop()
      results = results.map(a => {
        if (a.mess !== 0) {
          a.diff = Math.abs(a.mess - price)
        } else {
          a.diff = -1
        }
        return a
      })
      results.sort((a, b) => {
        if (a.diff < b.diff) {
          return -1
        } else if (a.diff > b.diff) {
          return 1
        } else {
          return a.timestamp - b.timestamp
        }
      })
      resolve(results)
    })
  }

  answerSignal (player) {
    return new Promise((resolve, reject) => {
      player.socket.on('answer', function (message) {
        resolve({ mess: parseInt(message), player: player, timestamp: Date.now() })
      })
      player.socket.on('disconnect', (reason) => {
        reject(reason)
      })
    })
  }

  readySignal (player) {
    return new Promise((resolve, reject) => {
      player.socket.on('ready', function () {
        resolve('ready')
      })
      setTimeout(reject, 4000, { status: 'connection error', player: player })
    })
  }
}

class Player {
  /**
   * @param {Socket} socket
   */
  constructor (socket) {
    /** @member {Socket} */
    this.socket = socket
    /** @member {Number} */
    this.score = 0
  }
}

class Clock {
  constructor (playerSet, seconds) {
    this.seconds = seconds
    this.actualValue = seconds
    this.playerSet = playerSet
    this.running = false
  }

  isRunning () {
    return this.running
  }

  start () {
    this.clock = setInterval(this.clockTimer, 1000, this)
    this.running = true
  }

  stop () {
    clearInterval(this.clock)
    this.actualValue = this.seconds // reset the timer
    this.running = false
  }

  clockTimer (self) {
    for (const player of self.playerSet) {
      player.socket.emit('clock', self.actualValue)
    }
    console.log(self.actualValue)
    if (self.actualValue === 0) {
      self.stop()
    }
    self.actualValue--
  }
}

module.exports = { GamesHandler }
