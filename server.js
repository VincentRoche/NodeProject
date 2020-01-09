const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
// const fs = require('fs')
const mongoose = require('mongoose')
const globalInfo = require('./globalinfo.js')
const sha256 = require('sha256')

const models = require('./mongoosestructures.js')
const Product = models[0]
const User = models[1]

// Chargement de socket.io
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

const { GamesHandler } = require('./game.js')
const { SessionHandler } = require('./session.js')
const sessions = new SessionHandler()
console.log(sessions)
const game = new GamesHandler(io, sessions)

app.use(morgan('tiny'))
app.use(cors({
  credentials: true,
  origin: 'http://localhost:8080'
}))

const path = require('path')
app.use(express.static(path.join(__dirname, 'dist/')))

app.use(bodyParser.json())

// Connection to the database
mongoose.connect(globalInfo[0], { useNewUrlParser: true, useUnifiedTopology: true })

// Runs at the start of the server
;(async () => {
  await fillProducts()
})()

// When user tries to create an account
app.post('/acc', (req, res) => {
  const newUser = new User({ username: req.body.username, password: req.body.password })
  newUser.save().then(() => { // If valid according to the mongoose schema
    // Generation/sending of a session ID
    const sessionId = sessions.generateSessionId(req.body.username)
    res.send(sessionId)
  }).catch(err => res.send(returnUserValidationErrors(err))) // Else we send errors
})

// When user tries to login
app.post('/log', (req, res) => {
  const userToFind = new User({ username: req.body.username, password: req.body.password })
  // To verify if valid according to mongoose schema
  userToFind.validate().then(async () => {
  // If valid, we try to retrieve it from database
    const foundUser = await User.findOne({ username: req.body.username, password: req.body.password })
    if (foundUser) { // If found, generation/sending of a session ID
      if (!sessions.isAlreadyConnected(req.body.username)) { // If user not already connected
        console.log('here')
        const sessionId = sessions.generateSessionId(req.body.username)
        res.send(sessionId)
      } else res.send(['User already connected.'])
    } else res.send(['User doesn\'t exist.']) // Else, user doesn't exist
  }).catch(err => res.send(returnUserValidationErrors(err))) // Else, we send errors
})

app.post('/logout', (req, res) => {
  sessions.destroySession(escape(req.body.sessionId))
  res.send('logged out')
})
// To save a product in database
async function createProduct (id, productName, productPrice) {
  return new Product({
    _id: id,
    name: productName,
    price: productPrice
  }).save()
}

// To fill the product collection if empty or not full
async function fillProducts () {
  // How many products in collection
  const countProducts = await Product.estimatedDocumentCount()
  if (countProducts < globalInfo[1].length) { // If less than expected
    await Product.collection.drop() // We drop it
    for (const p of globalInfo[1]) { // And fill it again
      await createProduct(p._id, p.name, p.price)
    }
  }
}

// To get and return errors
function returnUserValidationErrors (err) {
  let usernameError = ''
  let passwordError = ''
  const errors = []

  // If it is an error linked to the mongoose schema
  if (err.name === 'ValidationError') {
    if (err.errors.username) {
      usernameError = err.errors['username'].message
      errors.push(usernameError)
    }
    if (err.errors.password) {
      passwordError = err.errors['password'].message
      errors.push(passwordError)
    }
  // If another error was caught like 'Username already taken.'
  } else if (err.name === 'Error') {
    errors.push(err.message)
  }

  return errors
}

app.get('/', (req, res) => {
  res.json({
    message: 'Behold The MEVN Stack!'
  })
})

app.use(express.static('public'))

// Log promise errors
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, '\nReason:', reason, '\n', reason.stack)
})
