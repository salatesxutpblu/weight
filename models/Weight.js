const { Schema, model } = require('mongoose')

const schema = new Schema({
  date: {
    type: String,
    required: true
  },
  weight: {
    type: Date,
    required: true
  },
})

module.exports = model('Post', schema)
