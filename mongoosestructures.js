const mongoose = require('mongoose')
const sha256 = require('sha256')

const Schema = mongoose.Schema

const productSchema = new Schema({
  _id: {
    type: Number,
    required: ['Product id is required']
  },
  name: {
    type: String,
    required: ['Product name is required.']
  },
  price: {
    type: Number,
    required: ['Product price is required.']
  }
})

const userSchema = new Schema({
  username: {
    type: String,
    required: ['Username must not be empty.'],
    match: [/^[a-z0-9' ]+$/i, 'Invalid caracters detected in the username'],
    minlength: [3, 'Use 3 or more caracters for the username.'],
    maxlength: [20, 'The username is too long.']
  },
  password: {
    type: String,
    required: ['Password must not be empty.'],
    match: [/^[a-z0-9_!]+$/i, 'Invalid caracters detected in the password.'],
    minlength: [3, 'Use 3 or more caracters for the password.'],
    maxlength: [20, 'The password is too long.']
  }
})

userSchema.pre('save', function () {
  return new Promise((resolve, reject) => {
    this.password = sha256(this.password)
    this.model('Users').findOne({ username: this.username })
      .then(user => !user ? resolve() : reject(new Error('Username already taken.')))
  })
})

userSchema.pre('findOne', function () {
  return new Promise((resolve) => {
    if (this._conditions.password) {
      this._conditions.password = sha256(this._conditions.password)
    }
    resolve()
  })
})

const Product = mongoose.model('Products', productSchema, 'Products')
const User = mongoose.model('Users', userSchema, 'Users')

module.exports = [Product, User]
