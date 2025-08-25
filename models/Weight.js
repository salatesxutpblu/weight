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
  user: {
    type: String,
    ref: 'User',  // имя модели пользователя
    required: true
  },
  comment: {
    type: String,
    required: false
  },
})

module.exports = model('Weight', schema)
