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
})

module.exports = model('Post', schema)
