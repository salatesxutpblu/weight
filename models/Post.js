const { Schema, model } = require('mongoose')

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})

module.exports = model('Post', schema)
