const { Schema, model } = require('mongoose')

const schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: false
  }
})

module.exports = model('Weight', schema)
