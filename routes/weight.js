const { Router } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const Post = require('../models/Post')
const bcrypt = require('bcrypt')
const path = require('path')
const axios = require('axios');
const flash = require('connect-flash')
const session = require('express-session')
let Weight = require('../models/Weight')
let User = require('../models/User')
const router = Router()
let posts = []

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

router.use(express.urlencoded({ extended: false }))

router.use(flash());

router.use((req, res, next) => {
  res.locals.success = req.flash('success'); // сообщения об успехе
  res.locals.error = req.flash('error');     // сообщения об ошибках
  next();
});

router.get('/create-post', function(req, res) {
  res.render('create')
})

router.post('/login', async function(req, res) {
    let username = req.body.username
    let password = req.body.password

    let user = await User.findOne({username: req.body.username})
    if (!user) {
        req.flash('error', 'Неверный логин или пароль.');
        res.redirect('/login');
      return
    }
    let passwordIsCorrect = await bcrypt.compare(password, user.password)
    if (!user || passwordIsCorrect === false) {
        req.flash('error', 'Неверный логин или пароль.');
        res.redirect('/login');
    } else {
      req.session.user = username
      res.redirect('/')
    }
})

router.get('/login', function(req, res) {
  res.render('login', {
    error: res.locals.error
  })
})

router.post('/registration', async function(req, res) {
   let user = await User.findOne({username: req.body.username})
    if (user) {
      req.flash('error', 'Имя пользователя уже занято');
        res.redirect('/registration');
      return
    }

  if (!req.body.password.length) {
    req.flash('error', 'Введите пароль');
        res.redirect('/registration');
    return
  }

  let username = req.body.username
  let password = req.body.password
  let newUser = new User({
    username: username,
    password: await bcrypt.hash(password, await bcrypt.genSalt(SALT_WORK_FACTOR)),
    id: ''
  })
  newUser.id = newUser._id
  await newUser.save()
    req.session.user = username
    res.redirect('/')
})


router.get('/registration', function(req, res) {
  res.render('registration', {
    error: res.locals.error
  })
})

router.get('/', async function(req, res) {
    let username = getUsername(req)
    if (!username) {
        res.redirect('/registration')
        return
    }
    let user = await User.findOne({username: username})
    let weights = await Weight.find().lean()
    let filteredWeight = []
    let filteredMonthsAndYear = []


    for (let i = 0; i < weights.length; i++) {
      if (user.id === weights[i].user) {
        let month = ''
        let tempDate = new Date(weights[i].date)
        let year = tempDate.getFullYear()
        let numberMonth = Number(tempDate.getMonth()) + 1
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
    let month = Number(newDate.getMonth()) + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    res.render('new-weight', {
      date: date,
      error: res.locals.error
    })
})
router.get('/weights/:year/:month', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
    let filteredWeights = []
    let month = ''
    let username = getUsername(req)
    let user = await User.findOne({username: username})
    if (!username) {
        res.redirect('/login')
        return
    }
    let weights = await Weight.find().lean()
    for (let i = 0; i < weights.length; i++) {
    let tempDate = new Date(weights[i].date)
        if (Number(tempDate.getMonth() + 1) === Number(req.params.month) && Number(tempDate.getFullYear()) === Number(req.params.year) && weights[i].user === user.id) {
            filteredWeights.push(weights[i])

        }
    }
    let number = Number(req.params.month)

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
    res.render('month', {
      year: req.params.year,
      month: month,
      filteredWeights
    })
})

router.post('/weights/new', async function(req, res) {
  if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
    let date = req.body.date
    let weight = req.body.weight
    let username = getUsername(req)

    if (weight <= 0) {
          req.flash('error', 'Введите корректный вес!')    
          res.redirect('/weights/new')
          return
    }

    let today = new Date();
    let year = today.getFullYear()
    let day = today.getUTCDate()
    let user = await User.findOne({username: username})
    let month = today.getMonth()
    let newDate = date.split('-')
     if (Number(newDate[0]) > year) {
      req.flash('error', 'Введите корректный год!')    
      res.redirect('/weights/new')
      return
    }
    console.log(user)
    let newWeight = new Weight({
        date: new Date(date),
        weight: Number(weight),
        user: String(user.id),
        comment: req.body.comment,
    })
  console.log(user._id);
      
    await newWeight.save()
    res.redirect('/')
})

router.get('/logout', isAuthenticated, async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
    req.session.destroy((err) => {
      res.redirect('/login')
  })
})


router.get('/edit/:id', isAuthenticated, async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
    let id = req.params.id
    let el = await Weight.findById(id)
    let username = getUsername(req)
    let user = await User.findOne({username: username})
    if (el.user !== user.id) {
      res.redirect('/posts')
      return
    }
    let newDate = new Date(el.date)
    let year = newDate.getFullYear()
    let month = Number(newDate.getMonth()) + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    let comment = el.comment
    let weight = el.weight
    res.render('edit', {
      date: date,
      comment: comment,
      weight: weight,
      _id: el._id,
      error: res.locals.error
    })
})

router.post('/edit/confirm', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
      let date = req.body.date
    let weight = req.body.weight

    if (weight <= 0) {
          req.flash('error', 'Введите корректный вес!')    
          res.redirect(`/edit/${req.body.id}`)
          return
    }

    let today = new Date();
    let year = today.getFullYear()
    let day = today.getUTCDate()
    let month = today.getMonth()
    let newDate = date.split('-')
     if (Number(newDate[0]) > year) {
      req.flash('error', 'Введите корректный год!')    
      res.redirect(`/edit/${req.body.id}`)
      return
    }
    let el = await Weight.findById(req.body.id)
    let username = getUsername(req)
    let user = await User.findOne({username: username})
    if (el.user !== user.id) {
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
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let el = await Weight.findById(req.params.id)
  let username = getUsername(req)
  let user = await User.findOne({username: username})
    if (el.user !== user.id) {
      res.redirect('/')
      return
    }
  await Weight.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

router.post('/create', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let title = req.body.title
  let description = req.body.description
  let username = getUsername(req)
  let user = await User.findOne({username: username})
  let newPost = new Post({
    title: title,
    description: description,
    date: new Date(),
    user: user.id
  })
  await newPost.save()
  res.redirect('/')
})

router.get('/posts', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let pages = []
  const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit;
    posts = await Post.find({}).skip(skip).limit(limit).lean()
    const total = await Post.countDocuments()
    miniPosts = posts
    for (let i = 0; i < miniPosts.length; i++) {
      if (miniPosts[i].description.length > 300) {
        miniPosts[i].description = miniPosts[i].description.slice(0, 300) + '...'
      }
      if (miniPosts[i].title.length > 255) {
        miniPosts[i].title = miniPosts[i].title.slice(0, 255) + '...'
      }
    }
    let number = total / limit
    number = Math.floor(number)
    pages = []
    let a = getUsername(req)
    if (a === '') {
      a = false
    } else {
      a = true
    }
    for (let i = 1; i < number + 1; i++) {
      pages.push({
        number: i
      })
    }
    res.render('posts', {
      posts,
      miniPosts,
      pages,
      username: getUsername(req),
      authorized: a,
      user: getUsername(req)
    })
})

router.get('/edit-post/:id', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let el = await Post.findById(req.params.id)
  let username = getUsername(req)
  let user = await User.findOne({username: username})
    if (el.user !== user.id) {
      res.redirect('/')
      return
    }
  res.render('edit-post', {
    id: req.params.id,
    title: el.title,
    description: el.description
  })
})

router.post('/edited/:id', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let el = await Post.findById(req.params.id)
  let username = getUsername(req)
  let user = await User.findOne({username: username})
    if (el.user !== user.id) {
      res.redirect('/')
      return
    }

  el.title = req.body.title
  el.description = req.body.description

  await el.save()
  res.redirect('/posts')
})

router.post('/delete-post/:id', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let el = await Post.findById(req.params.id)
  let username = getUsername(req)
  let user = await User.findOne({username: username})
    if (el.user !== user.id) {
      res.redirect('/')
      return
    }

  let a = await Post.findByIdAndDelete(req.params.id)
  res.redirect('/posts')
})

router.get('/posts/:id', async function(req, res) {
    if (getUsername(req) === '') {
    res.redirect('/login')
    return
  }
  let el = await Post.findById(req.params.id)

  res.render('singlepost', {
    title: el.title,
    description: el.description
  })
})

router.get('/page/')

module.exports = router