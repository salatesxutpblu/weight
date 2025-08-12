const { Router } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
let Weight = require('../models/Weight')
const router = Router()

router.get('/', async function(req, res) {
    let weights = await Weight.find().lean()
    let filteredWeight = []
    let filteredMonthsAndYear = []
    for (let i = 0; i < weights.length; i++) {
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
        if (filteredMonthsAndYear.includes(year) && filteredMonthsAndYear.includes(month)) {
            return
        }
        filteredMonthsAndYear.push({
            year,
            month,
            numberMonth
        })
    }
    res.render('index', {
        filteredMonthsAndYear
    }
    )
})
router.get('/weights/new', async function(req, res) {
    res.render('new-weight')
})
router.get('/weights/:year/:month', async function(req, res) {
    let filteredWeights = []
    let month = ''
    let weights = await Weight.find().lean()
    for (let i = 0; i < weights.length; i++) {
                let tempDate = new Date(weights[i].date)
        if (Number(tempDate.getMonth()) === Number(req.params.month) && Number(tempDate.getFullYear()) === Number(req.params.year)) {
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
        console.log(filteredWeights)
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
    let fixWeight = Number(weight)
    let newWeight = new Weight({
        date: new Date(date),
        weight: fixWeight
    })
    await newWeight.save()
    res.redirect('/')
})


module.exports = router