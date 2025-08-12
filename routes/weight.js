const { Router } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
let Weight = require('../models/Weight')
const router = Router()

router.get('/', async function(req, res) {
    res.render('index')
})
router.get('/weights/new', async function(req, res) {
    res.render('new-weight')
})
router.get('/weights/:year/:month', async function(req, res) {
    let month = ''
    if (Number(req.params.month) === 1) {
        month = 'Январь'
    }
    if (Number(req.params.month) === 2) {
        month = 'Февраль'
    }
    if (Number(req.params.month) === 3) {
        month = 'Март'
    }
    res.render('month', {
      year: req.params.year,
      month: month
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
            console.log(day, newDate[0])
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
    let newWeight = new Weight({
        date: new Date(date),
        weight: weight
    })

    await newWeight.save()
    res.redirect('/')
})


module.exports = router