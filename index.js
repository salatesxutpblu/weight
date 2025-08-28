const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')
const weightRoutes = require('./routes/weight')
const authRoutes = require('./routes/auth')
const flash = require('connect-flash')
const postRoutes = require('./routes/post')

const PORT = process.env.PORT || 3000
const app = express()

app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.set('layout', 'layouts/main')
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false })) 

app.use(session({
  secret: 'fasdasdfsadsaddsa',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // для разработки без HTTPS
}))


app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(authRoutes, weightRoutes, postRoutes)




async function start() {
  try {
    await mongoose.connect(
      'mongodb://localhost:27017/weight',
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
