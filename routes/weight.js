const { Router } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const axios = require('axios');
const session = require('express-session')
let Weight = require('../models/Weight')
let User = require('../models/User')
const router = Router()

let SALT_WORK_FACTOR = 10

function getUsername(req) {
  return req.session.user
}

async function isAuthenticated(req, res, next) {
  let username = req.session.user
  if (await User.findOne({username: username})) {
    req.session.user = username
    return next()
  }
  res.redirect('/login')
}

router.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'fasdasdfsadsaddsa'
}))


router.post('/login', async function(req, res) {
    let username = req.body.username
    let password = req.body.password

    let user = await User.findOne({username: req.body.username})
    if (!user) {
      res.render('login', {
        error: 'Логин или пароль неверные'
      })
      return
    }
    let passwordIsCorrect = await bcrypt.compare(password, user.password)
    if (!user || passwordIsCorrect === false) {
      res.render('login', {
        error: 'Логин или пароль неверные'
      })
    } else {
      req.session.user = username
      res.redirect('/')
    }
})

router.get('/login', function(req, res) {
    res.render('login', {
        error: ''
    })
})

router.post('/registration', async function(req, res) {
   let user = await User.findOne({username: req.body.username})
   console.log(user)
    if (user) {
      res.render('registration', {
        error: 'Имя пользователя уже занято!'
      })
      return
      console.log('Имя пользователя уже занято!')
    }

  if (!req.body.password.length) {
    res.render('registration', {
        error: 'Введите пароль'
      })
    return
  }

  let username = req.body.username
  let password = req.body.password
  let newUser = new User({
    username: username,
    password: await bcrypt.hash(password, await bcrypt.genSalt(SALT_WORK_FACTOR)),
  })
  await newUser.save()
    req.session.user = username
    res.redirect('/')
})


router.get('/registration', function(req, res) {
    res.render('registration', {
        error: ''
    })
})

router.get('/', async function(req, res) {
    let username = getUsername(req)
    if (!username) {
        res.redirect('/registration')
        return
    }
    let weights = await Weight.find().lean()
    let filteredWeight = []
    let filteredMonthsAndYear = []


    for (let i = 0; i < weights.length; i++) {
        if (weights[i].username === username) {
        let month = ''
        let tempDate = new Date(weights[i].date)
        let year = tempDate.getFullYear()
        let numberMonth = tempDate.getMonth() + 1
        if (numberMonth === 1) { month = 'Январь' }
        if (numberMonth === 2) { month = 'Февраль' }
        if (numberMonth === 3) { month = 'Март' }
        if (numberMonth === 4) { month = 'Апрель' }
        if (numberMonth === 5) { month = 'Май' }
        if (numberMonth === 6) { month = 'Июнь' }
        if (numberMonth === 7) { month = 'Июль' }
        if (numberMonth === 8) { month = 'Август' }
        if (numberMonth === 9) { month = 'Сентябрь' }
        if (numberMonth === 10) { month = 'Октябрь' }
        if (numberMonth === 11) { month = 'Ноябрь' }
        if (numberMonth === 12) { month = 'Декабрь' }
        if (
        filteredMonthsAndYear.some(
          obj =>
            obj.year === year &&
            obj.month === month &&
            obj.numberMonth === numberMonth
        )
        ) {
        } else {
        filteredMonthsAndYear.push({ year, month, numberMonth });
        }

        }
    }
    console.log(filteredMonthsAndYear)
    res.render('index', {
        filteredMonthsAndYear
    }
    )
})
router.get('/weights/new', async function(req, res) {
  let username = getUsername(req)
    if (!username) {
        res.redirect('/login')
        return
    }
    let newDate = new Date()
    let year = newDate.getFullYear()
    let month = newDate.getMonth() + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    res.render('new-weight', {
      date: date,
      error: ''
    })
})
router.get('/weights/:year/:month', async function(req, res) {
    let filteredWeights = []
    let month = ''
    let username = getUsername(req)
    if (!username) {
        res.redirect('/login')
        return
    }
    let weights = await Weight.find().lean()
    console.log(weights)
    for (let i = 0; i < weights.length; i++) {
    let tempDate = new Date(weights[i].date)
        if (Number(tempDate.getMonth() + 1) === Number(req.params.month) && Number(tempDate.getFullYear()) === Number(req.params.year) && weights[i].username === username) {
            filteredWeights.push(weights[i])
        }
    }
    let number = req.params.month + 1

    if (number === 1) { month = 'Январь' }
    if (number === 2) { month = 'Февраль' }
    if (number === 3) { month = 'Март' }
    if (number === 4) { month = 'Апрель' }
    if (number === 5) { month = 'Май' }
    if (number === 6) { month = 'Июнь' }
    if (number === 7) { month = 'Июль' }
    if (number === 8) { month = 'Август' }
    if (number === 9) { month = 'Сентябрь' }
    if (number === 10) { month = 'Октябрь' }
    if (number === 11) { month = 'Ноябрь' }
    if (number === 12) { month = 'Декабрь' }
    console.log(filteredWeights)
    res.render('month', {
      year: req.params.year,
      month: month,
      filteredWeights
    })
})

router.post('/weights/new', async function(req, res) {
    let date = req.body.date
    let weight = req.body.weight
    let username = getUsername(req)

    if (weight <= 0) {
        res.render('new-weight', {
          error: 'Введите корректный вес',
          date: date
        })
        return
    }

    let today = new Date();
    let year = today.getFullYear()
    let day = today.getUTCDate()
    let month = today.getMonth()
    let newDate = date.split('-')
     if (Number(newDate[0]) > year) {
      res.render('new-weight', {
          error: 'Введите корректный год',
          date: date    
        })
        return        
    }
    let newWeight = new Weight({
        date: new Date(date),
        weight: Number(weight),
        username: username,
        comment: req.body.comment
    })
    await newWeight.save()
    res.redirect('/')
})

router.get('/logout', isAuthenticated, async function(req, res) {
    req.session.destroy((err) => {
      res.redirect('/login')
  })
})


router.get('/edit/:id', isAuthenticated, async function(req, res) {
    let id = req.params.id
    let el = await Weight.findById(id)
    let newDate = new Date(el.date)
    let year = newDate.getFullYear()
    let month = newDate.getMonth() + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    console.log(date)
    let comment = el.comment
    let weight = el.weight
    res.render('edit', {
      date: date,
      comment: comment,
      weight: weight,
      _id: el._id
    })
})

router.post('/edit/confirm', async function(req, res) {
    let el = await Weight.findById(req.body.id)
    let username = getUsername(req)
    if (el.username !== username) {
      res.redirect('/')
      return
    }

    el.weight = req.body.weight
    el.comment = req.body.comment
    el.date = req.body.date

    await el.save()
    res.redirect('/')
})

router.post('/delete/:id', async function(req, res) {
  let el = await Weight.findById(req.params.id)
  let username = getUsername(req)
    if (el.username !== username) {
      res.redirect('/')
      return
    }
  await Weight.findByIdAndDelete(req.params.id)
  res.redirect('/')
})


module.exports = router