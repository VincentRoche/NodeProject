const models = require('./mongoosestructures.js')
// const mongoose = require('mongoose')
// const globalInfo = require('./globalinfo.js')
const Product = models[0]

// mongoose.connect(globalInfo[0], { useNewUrlParser: true, useUnifiedTopology: true })

class GamesHandler {
  constructor (server) {
    /** @member {Array<Game>} */
    this.pendingGames = {}
    this.io = require('socket.io')(server, {
      // path: '/game',
      pingInterval: 2000,
      pingTimeout: 4000
    })
    // this.socketsListener = io.listen(server)
    server.listen(8080)
    console.log('Socket listening on port 8080')
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
      socket.on('joinGame', function (message) {
        if (games[message.gameNumber] && !games[message.gameNumber].started) {
          if (games[message.gameNumber].addPlayer(new Player(message.name, socket))) {
            this.emit('errorGameFull')
          } else {
            this.emit('gameJoined')
            console.log('Player', message.name, 'joined game n°', message.gameNumber)
          }
        } else if (!games[message.gameNumber]) {
          this.emit('errorNotExist')
        } else if (games[message.gameNumber].started) {
          this.emit('errorAlreadyStarted')
        }
      })
      socket.on('hostGame', function () {
        const newGame = self.getHostNumber(socket, self)
        console.log('newgame', newGame)
        games[newGame].addPlayer(new Player('Host', socket))
        this.emit('gameNumber', { gameNumber: newGame })
      })
    })
  }

  getHostNumber (hostSocket, self) {
    let newGame = Math.floor(Math.random() * 3000)
    if (Object.keys(self.pendingGames).includes(newGame)) {
      newGame = null
    } else {
      self.pendingGames[newGame] = new Game(hostSocket)
    }
    return newGame || self.getHostNumber()
  }
}

class Game {
  constructor (hostSocket) {
    this.players = []
    this.maxPlayers = 2
    this.nbRounds = 3
    this.roundDuration = 10
    this.started = false
    this.hostSocket = hostSocket
    const self = this
    this.hostSocket.on('GameStart', function () {
      console.log('startGame')
      self.sendAll('GameStart')
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
    // deconnection event added
    player.socket.on('disconnect', function () {
      self.removePlayer(player)
    })
    this.players.push(player)
    return true
  }

  removePlayer (player) {
    this.players = this.players.filter(e => e.name !== player.name)
    player.socket.disconnect()
    console.log(`Player ${player.name} disconnected`)
  }

  updateSettings (settings) {
    this.maxPlayers = settings.maxPlayers | this.maxPlayers
    this.nbRounds = settings.rounds | this.nbRounds
    this.roundDuration = settings.roundDuration | this.roundDuration
    this.sendAll('settingsUpdated', settings)
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

  startGame () {
    this.started = true
    // get nbRounds Objects
    this.sendAll('GameStart')
    // for (round of this.nbRounds) {
    //     this.startRound({name:'patate', image: 'patate.jpg'})
    // }
    const clock = new Clock(this.players, 10)
    this.startRound({ name: 'patate', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/234_Solanum_tuberosum_L.jpg', price: 100 }, clock)
  }

  async startRound (object, clock) {
    const readyPlayers = []
    const answerPromises = []
    for (const player of this.players) {
      player.socket.emit('RoundStart', { name: object.name, image: object.image })
      readyPlayers.push(this.readySignal(player))
      answerPromises.push(this.answerSignal(player))
    }
    clock.start()
    await Promise.all(readyPlayers)
    this.score(await this.compareAnswers(answerPromises, clock, object.price))
  }

  generateScoreBoard () {
    const scoreBoard = []
    for (const player of this.players) {
      scoreBoard.push({ name: player.name, score: player.score })
    }
    scoreBoard.sort((a, b) => a.score - b.score).reverse()
    // console.log(scoreBoard)
    return scoreBoard
  }

  score (answers) {
    let score = this.players.length
    for (const player of this.players) {
      if (player.score >= 0) {
        player.score += score--
      }
    }
    const scoreboard = this.generateScoreBoard()
    this.sendAll('score', scoreboard)
  }

  async compareAnswers (answerPromises, clock, price) {
    return new Promise(async (resolve, reject) => {
      let results = await Promise.all(answerPromises)
      console.log(results)
      clock.stop()
      results = results.map(a => {
        if (a.mess !== 0) {
          a.mess = Math.abs(a.mess - price)
        } else {
          a.mess = -1
        }
        return a
      })
      results.sort((a, b) => {
        if (a.price < b.price) {
          return -1
        } else if (a.price > b.price) {
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
        resolve({ mess: parseInt(message), name: player.name, timestamp: Date.now() })
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
   * @param {String} name
   * @param {Socket} socket
   */
  constructor (name, socket, host) {
    /** @member {String} */
    this.name = name
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
    if (self.actualValue === 0) {
      self.stop()
    }
    self.actualValue--
  }
}

module.exports = { GamesHandler }
