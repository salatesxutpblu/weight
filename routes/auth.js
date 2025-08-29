const { Router } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const {isAuthenticated, getUser} = require('../lib')
let Weight = require('../models/Weight')
let User = require('../models/User')
const router = Router()

router.post('/login', async function(req, res) {
    let username = req.body.username
    let password = req.body.password

    let user = await User.findOne({username: username})
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
      req.session.user = user
      res.redirect('/')
    }
})

router.get('/login', function(req, res) {
  res.render('auth/login', {
    error: res.locals.error ?? ''
  })
})

router.post('/registration', async function(req, res) {
    let a = await User.findOne({ username: req.body.username })
    if (a.username.length) {
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
  })
  await newUser.save()
    req.session.user = username
    res.redirect('/')
})


router.get('/registration', function(req, res) {
  res.render('auth/registration', {
    error: res.locals.error
  })
})

router.get('/logout', isAuthenticated, async function(req, res) {
    req.session.destroy((err) => {
      res.redirect('/login')
  })
})

module.exports = router