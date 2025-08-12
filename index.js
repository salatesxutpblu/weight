const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const weightRoutes = require('./routes/weight')

const PORT = process.env.PORT || 3000

const app = express()

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(weightRoutes)

async function start() {
  try {
    await mongoose.connect(
      'mongodb://localhost:27017/test',
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })
  } catch (e) {
    console.log(e)
  }
}

start()
