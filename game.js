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
    this.io.on('connection', function (socket) {
      socket.on('joinGame', function (message) {
        if (games[message.gameNumber]) {
          games[message.gameNumber].addPlayer(new Player(message.name, socket))
          console.log('Player', message.name, 'joined game n°', message.gameNumber)
        }
      })
      socket.on('hostGame', function (hostNumber) {
        games[hostNumber] = new Game(hostNumber)
      })
      socket.on('disconnect', function () {
        this.disconnect()
        console.log('Player disconnected')
      })
    })
  }

  getHostNumber () {
    const newGame = parseInt(Object.keys(this.pendingGames)[Object.keys(this.pendingGames).length - 1]) + 1
    return newGame || 1
  }
}

class Game {
  constructor () {
    this.players = []
    this.maxPlayers = 2
    this.nbRounds = 3
  }

  addPlayer (player) {
    this.players.push(player)
    if (this.players.length === this.maxPlayers) {
      this.startGame()
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
    // get nbRounds Objects
    for (const player of this.players) {
      player.socket.emit('GameStart')
    }
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

    for (const player of this.players) {
      const scoreboard = this.generateScoreBoard()
      player.socket.emit('score', scoreboard)
    }
  }

  async compareAnswers (answerPromises, clock, price) {
    return new Promise(async (resolve, reject) => {
      let results = await Promise.all(answerPromises)
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

  removeElement (player) {
    this.players = this.players.filter(e => e.name !== player.name)
    player.socket.disconnect()
  }
}

class Player {
  /**
   * @param {String} name
   * @param {Socket} socket
   */
  constructor (name, socket) {
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
