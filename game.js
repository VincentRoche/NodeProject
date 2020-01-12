const models = require('./mongoosestructures.js')
// const mongoose = require('mongoose')
const globalinfo = require('./globalinfo.js')
const Product = models[0]
const fs = require('fs')
const allSettled = require('promise.allsettled')
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
      return 'productPictures/' + name + type
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
    console.log('HANDLER', this.sessionHandler)
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
        const playerName = self.sessionHandler.getUsername(this.handshake.query.sessionId)
        console.log(`${playerName} wants to join game ${message.gameNumber}`)
        const game = games[message.gameNumber]
        if (game && !game.started) {
          if (!games[message.gameNumber].addPlayer(new Player(socket, playerName))) {
            this.emit('errorGameFull')
            console.log(`errorGameFull for ${playerName}`)
          } else {
            this.emit('gameJoined')
            game.sendAll('players', game.getPlayers())
            this.emit('settingsUpdated', game.getSettings())
            console.log('Player', playerName, 'joined game n°', message.gameNumber)
          }
        } else if (!game) {
          this.emit('errorNotExist')
          console.log(`errorNotExist for ${playerName}`)
        } else if (game.started) {
          this.emit('errorAlreadyStarted')
          console.log(`errorAlreadyStarted for ${playerName}`)
        }
      })
      socket.on('hostGame', function () {
        const newGame = self.getHostNumber(socket, self)
        games[newGame].addPlayer(new Player(socket, self.sessionHandler.getUsername(this.handshake.query.sessionId)))
        this.emit('gameNumber', { gameNumber: newGame })
        this.emit('players', games[newGame].getPlayers())
      })
      // Logout if the socket disconnects
      socket.on('disconnect', function () {
        self.sessionHandler.destroySession(this.handshake.query.sessionId)
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
      console.log(`Socket ${player.socket.handshake.query.sessionId} (${player.name}) disconnected`)
      self.removePlayer(player)
    })
    // wanted disconnection
    player.socket.on('leaveGame', function () {
      console.log(`Player ${player.name} leaveGame`)
      self.removePlayer(player)
    })
    this.players.push(player)
    return true
  }

  removePlayer (player) {
    this.players = this.players.filter(e => e.socket.handshake.query.sessionId !== player.socket.handshake.query.sessionId)
    const name = player.name
    // player.socket.removeAllListeners().disconnect()
    console.log(`Player ${name} removed from game`)
    if (this.players.length === 0) {
      this.started = false
      console.log('Game stopped, no player left')
    }
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
      toReturn.push(player.name)
    }
    return toReturn
  }

  sendAll (messageType, messageContent = {}) {
    console.log(`sendAll(${messageType}, ${JSON.stringify(messageContent)}) to ${this.players.length} players`)
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
    let round = 1
    while (round <= this.nbRounds && this.started) {
      const currProd = products[round - 1]
      await this.startRound({ round: round, name: currProd.name, image: getFileName(currProd._id), price: currProd.price }, roundClock)
      await pause()
      round++
    }
    this.sendAll('GameEnd')
    this.players = []
    this.started = false
  }

  async startRound (object, clock) {
    console.log(`startRound ${object.round}`)
    const readyPlayers = []
    const answerPromises = []
    for (const player of this.players) {
      console.log(`RoundStart to ${player.name}`)
      player.socket.emit('RoundStart', { name: object.name, image: object.image, round: object.round })
      readyPlayers.push(this.readySignal(player))
      answerPromises.push(this.answerSignal(player))
    }
    clock.start()
    console.log('Waiting for ready signals...')
    const results = await allSettled(readyPlayers)
    results.forEach((result) => {
      if (result.status === 'rejected') {
        this.removePlayer(result.player)
      }
    })
    console.log('All ready.')
    this.score(await this.compareAnswers(answerPromises, clock, object.price), object.price)
  }

  generateScoreBoard () {
    const scoreBoard = []
    for (const player of this.players) {
      scoreBoard.push({ name: player.name, score: player.score })
    }
    scoreBoard.sort((a, b) => a.score - b.score).reverse()
    return scoreBoard
  }

  whiteListAnswers (answers, context) {
    const whiteList = []
    for (const ans of answers) {
      whiteList.push({
        name: context.sessionHandler.getUsername(ans.value.player.socket.handshake.query.sessionId),
        answer: ans.value.mess
      })
    }
    return whiteList
  }

  score (answers, price) {
    let score = answers.length
    console.log(answers)
    for (const answer of answers) {
      if (answer !== undefined && answer.value.mess > 0) {
        answer.value.player.score += score
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
      let results = await allSettled(answerPromises)
      results.forEach((res) => {
        console.log(res)
        if (res.status === 'rejected') {
          const index = results.indexOf(res)
          console.log('index to remove', index)
          if (index !== -1) {
            results.splice(index, 1)
          }
        }
      })
      clock.stop()
      console.log(results)
      results = results.map(a => {
        if (a.value) {
          if (a.value.mess !== 0) {
            a.diff = Math.abs(a.value.mess - price)
          } else {
            a.diff = -1
          }
          return a
        }
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
      resolve(results.filter((el) => el !== undefined))
    })
  }

  answerSignal (player) {
    return new Promise((resolve, reject) => {
      player.socket.on('answer', function (message) {
        console.log(`Player ${player.name} answered ${message}`)
        resolve({ mess: parseInt(message), player: player, timestamp: Date.now() })
      })
      player.socket.on('disconnect', (reason) => {
        console.log(`Reject answerSignal for player ${player.name}`)
        // this.removePlayer(player)
        reject(reason)
      })
    })
  }

  readySignal (player) {
    return new Promise((resolve, reject) => {
      player.socket.on('ready', function () {
        console.log(`Player ${player.name} ready`)
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
  constructor (socket, name) {
    /** @member {Socket} */
    this.socket = socket
    /** @member {String} */
    this.name = name
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
