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
const server = require('http').createServer(app)
const { GamesHandler } = require('./game.js')
const game = new GamesHandler(server)

app.use(morgan('tiny'))
app.use(cors())
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
    let sessionId = generateSessionId()
    globalInfo[2][sessionId] = req.body.username
    res.send(sessionId)
  }).catch(err => res.send(returnUserValidationErrors(err))) // Else we send errors
})

// When user tries to login
app.post('/log', (req, res) => {
  const userToFind = new User({ username: req.body.username, password: req.body.password })
  // To verify if valid according to mongoose schema
  userToFind.validate().then(async () => {
  // If valid, we try to retrieve it from database
    let foundUser = await User.findOne({ username: req.body.username, password: req.body.password })
    if (foundUser) { // If found, generation/sending of a session ID
      let sessionId = generateSessionId()
      globalInfo[2][sessionId] = req.body.username
      res.send(sessionId)
    } else res.send(['User doesn\'t exist.']) // Else, user doesn't exist
  }).catch(err => res.send(returnUserValidationErrors(err))) // Else, we send errors
})

// To generate a session ID
function generateSessionId () {
  let sessionId
  // To be sure we don't get an already in use session ID
  while (globalInfo[2].includes(sessionId) || !sessionId) {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    sessionId = sha256(randomString)
  }
  return sessionId
}

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
  let errors = []

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

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`listening on ${port}`)
})



app.use(express.static('public'))
