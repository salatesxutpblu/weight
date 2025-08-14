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
  
    if (!user) {
      res.render('registration', {
        error: 'Имя пользователя уже занято!'
      })
      return
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
        let numberMonth = tempDate.getMonth()
        if (tempDate.getMonth() === 1) { month = 'Январь' }
        if (tempDate.getMonth() === 2) { month = 'Февраль' }
        if (tempDate.getMonth() === 3) { month = 'Март' }
        if (tempDate.getMonth() === 4) { month = 'Апрель' }
        if (tempDate.getMonth() === 5) { month = 'Май' }
        if (tempDate.getMonth() === 6) { month = 'Июнь' }
        if (tempDate.getMonth() === 7) { month = 'Июль' }
        if (tempDate.getMonth() === 8) { month = 'Август' }
        if (tempDate.getMonth() === 9) { month = 'Сентябрь' }
        if (tempDate.getMonth() === 10) { month = 'Октябрь' }
        if (tempDate.getMonth() === 11) { month = 'Ноябрь' }
        if (tempDate.getMonth() === 12) { month = 'Декабрь' }
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
    res.render('new-weight')
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
    for (let i = 0; i < weights.length; i++) {
    let tempDate = new Date(weights[i].date)
        if (Number(tempDate.getMonth()) === Number(req.params.month) && Number(tempDate.getFullYear()) === Number(req.params.year) && weights[i].username === username) {
            filteredWeights.push(weights[i])
        }
    }

    if (Number(req.params.month) === 1) { month = 'Январь' }
    if (Number(req.params.month) === 2) { month = 'Февраль' }
    if (Number(req.params.month) === 3) { month = 'Март' }
    if (Number(req.params.month) === 4) { month = 'Апрель' }
    if (Number(req.params.month) === 5) { month = 'Май' }
    if (Number(req.params.month) === 6) { month = 'Июнь' }
    if (Number(req.params.month) === 7) { month = 'Июль' }
    if (Number(req.params.month) === 8) { month = 'Август' }
    if (Number(req.params.month) === 9) { month = 'Сентябрь' }
    if (Number(req.params.month) === 10) { month = 'Октябрь' }
    if (Number(req.params.month) === 11) { month = 'Ноябрь' }
    if (Number(req.params.month) === 12) { month = 'Декабрь' }
    res.render('month', {
      year: req.params.year,
      month: month,
      filteredWeights
    })
})

router.post('/weights/new', async function(req, res) {
    let date = req.body.date
    let weight = req.body.weight

    if (weight < 0) {
        return
        res.send('Введите корректный вес')
    }

    let today = new Date();
    let year = today.getFullYear()
    let day = today.getUTCDate()
    let month = today.getMonth() + 1
    let newDate = date.split('-')
    if (Number(newDate[0] < year)) {
    let fixWeight = Number(weight)
    let newWeight = new Weight({
        date: new Date(date),
        weight: fixWeight
    })
    await newWeight.save()
    res.redirect('/')
    return
    }
     if (Number(newDate[0]) > year) {
        res.send('Введите корректный год')
        return        
    }
    if (Number(newDate[1]) > month) {
        res.send('Введите корректный месяц')
        return        
    }
    if (Number(newDate[2]) > Number(day)) {
        res.send('Введите корректный день')
        return
    }
    let username = getUsername(req)
    let fixWeight = Number(weight)
    let newWeight = new Weight({
        date: new Date(date),
        weight: fixWeight,
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


module.exports = router