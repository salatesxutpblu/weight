const { Router } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const {isAuthenticated, getUser, getMonthByNumber} = require('../lib')
let Weight = require('../models/Weight')
let User = require('../models/User')
const router = Router()

let SALT_WORK_FACTOR = 10



router.get('/', isAuthenticated, async function(req, res) {
    let user = getUser(req)
    let weights = await Weight.find({ user: user._id });
    let filteredMonthsAndYear = []


    for (let i = 0; i < weights.length; i++) {
        let month = ''
        let tempDate = new Date(weights[i].date)
        let year = tempDate.getFullYear()
        let numberMonth = Number(tempDate.getMonth())
        month = getMonthByNumber(numberMonth)
        if ( !filteredMonthsAndYear.some(
           obj => 
            obj.year === year && 
            obj.month === month &&
            obj.numberMonth === numberMonth )
          ) {
              filteredMonthsAndYear.push({ year, month, numberMonth });
          }
    }
    res.render('weights/index', {
        filteredMonthsAndYear
    }
    )
})
router.get('/weights/create', isAuthenticated, async function(req, res) {
    let newDate = new Date()
    let year = newDate.getFullYear()
    let month = Number(newDate.getMonth()) + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    res.render('weights/create', {
      date: date,
      error: res.locals.error
    })
})

router.get('/weights/:year/:month', isAuthenticated, async function(req, res) {
    let user = getUser(req)
    let startDate = new Date(req.params.year, req.params.month, 1)
    let endDate = new Date(req.params.year, Number(req.params.month) + 1, 1)
    const filteredWeights = await Weight.find({
      user: user._id,
      date: { $gte: startDate, $lt: endDate }
    }).lean();
    let numberMonth = req.params.month
    let month = getMonthByNumber(numberMonth)


    res.render('weights/show', {
      year: req.params.year,
      month: month,
      filteredWeights
    })
})

router.post('/weights/create', isAuthenticated, async function(req, res) {
    let date = req.body.date
    let weight = req.body.weight

    if (weight <= 0) {
          req.flash('error', 'Введите корректный вес!')    
          res.redirect('/weights/new')
          return
    }

    let today = new Date();
    let year = today.getFullYear()
    let user = getUser(req)
    let newDate = date.split('-')
     if (Number(newDate[0]) > year) {
      req.flash('error', 'Введите корректный год!')    
      res.redirect('/weights/new')
      return
    }
    let newWeight = new Weight({
        date: new Date(date),
        weight: Number(weight),
        user: String(user._id),
        comment: req.body.comment,
    })
      
    await newWeight.save()
    res.redirect('/')
})



router.get('/weights/:id', isAuthenticated, async function(req, res) {
    let id = req.params.id
    let el = await Weight.findById(id)
    let user = getUser(req)
    
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }
    let newDate = new Date(el.date)
    let year = newDate.getFullYear()
    let month = Number(newDate.getMonth()) + 1
    let day = newDate.getDate()
    let date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    let comment = el.comment
    let weight = el.weight
    res.render('weights/update', {
      date: date,
      comment: comment,
      weight: weight,
      _id: el._id,
      error: res.locals.error
    })
})

router.post('/weights/update', isAuthenticated, async function(req, res) {
      let date = req.body.date
    let weight = req.body.weight

    if (weight <= 0) {
          req.flash('error', 'Введите корректный вес!')    
          res.redirect(`/weights/update/${req.body.id}`)
          return
    }

    let today = new Date();
    let year = today.getFullYear()
    let newDate = date.split('-')
     if (Number(newDate[0]) > year) {
      req.flash('error', 'Введите корректный год!')    
      res.redirect(`/edit/${req.body.id}`)
      return
    }
    let el = await Weight.findById(req.body.id)
    let user = getUser(req)
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }

    el.weight = req.body.weight
    el.comment = req.body.comment
    el.date = req.body.date

    await el.save()
    res.redirect('/')
})

router.post('/weights/delete/:id', isAuthenticated, async function(req, res) {
  let el = await Weight.findById(req.params.id)
  let user = getUser(req)
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }
  await Weight.findByIdAndDelete(req.params.id)
  res.redirect('/')
})


module.exports = router