const { Schema, model } = require('mongoose')
const Weight = require('./Weight')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true,}
})

userSchema.pre('remove', async function(next) {
  await Weight.deleteMany({ user: this._id })
  next()
})


const User = mongoose.model('User', userSchema)
module.exports = User
