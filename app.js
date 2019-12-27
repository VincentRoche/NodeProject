const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
// const fs = require('fs')
const mongoose = require('mongoose')

const globalInfo = require('./globalinfo.js')

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

mongoose.connect(globalInfo[0], { useNewUrlParser: true, useUnifiedTopology: true })

;(async () => {
  await fillProducts()
})()

app.post('/acc', (req, res) => {
  const newUser = new User({ username: req.body.username, password: req.body.password })
  newUser.save().then(async () => res.send('User saved.')).catch(err => res.send(returnUserValidationErrors(err)))
})

app.post('/log', (req, res) => {
  const userToFind = new User({ username: req.body.username, password: req.body.password })
  userToFind.validate().then(() =>
    User.findOne({ username: req.body.username, password: req.body.password }).then(user => {
      if (user) res.send('User logged in.')
      else res.send('User doesn\'t exist.')
    })).catch(err => res.send(returnUserValidationErrors(err)))
})

async function createProduct (id, productName, productPrice) {
  return new Product({
    _id: id,
    name: productName,
    price: productPrice
  }).save()
}

async function fillProducts () {
  const countProducts = await Product.estimatedDocumentCount()
  if (countProducts < globalInfo[1].length) {
    await Product.collection.drop()
    for (const p of globalInfo[1]) {
      await createProduct(p._id, p.name, p.price)
    }
  }
}

function returnUserValidationErrors (err) {
  let usernameError = ''
  let passwordError = ''
  let errors = []

  if (err.name === 'ValidationError') {
    if (err.errors.username) {
      usernameError = err.errors['username'].message
      errors.push(usernameError)
    }
    if (err.errors.password) {
      passwordError = err.errors['password'].message
      errors.push(passwordError)
    }
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

/*
function getFileName (name) {
  const types = ['.jpg', '.png', '.jpeg', '.bmp']
  for (type of types) {
    if (fs.existsSync('./productPictures/' + name + type)) {
      return name + type
    }
  }
  return -1
}

app.use(express.static(__dirname + '/productPictures'))
*/
