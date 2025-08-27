const { Router } = require('express')
const express = require('express')
const Post = require('../models/Post')
const flash = require('connect-flash')
const {isAuthenticated, getUser} = require('../lib')
const session = require('express-session')
let User = require('../models/User')
const router = Router()


router.use(isAuthenticated)


router.get('/create-post', isAuthenticated, function(req, res) {
  res.render('create')
})

router.get('/dddd', function() {
  res.render('posts')
})

router.post('/create', isAuthenticated, async function(req, res) {
  let title = req.body.title
  let description = req.body.description
  let user = getUser(req)
  let newPost = new Post({
    title: title,
    description: description,
    date: new Date(),
    user: user._id
  })
  await newPost.save()
  res.redirect('/')
})

router.get('/posts', isAuthenticated, async function(req, res) {
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
    let a = getUser(req)
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
    })
})

router.get('/edit-post/:id', isAuthenticated, async function(req, res) {
  let el = await Post.findById(req.params.id)
  let user = getUser(req)
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }
  res.render('edit-post', {
    id: req.params.id,
    title: el.title,
    description: el.description
  })
})

router.post('/edited/:id', isAuthenticated, async function(req, res) {
  let el = await Post.findById(req.params.id)
 let user = getUser(req)
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }

  el.title = req.body.title
  el.description = req.body.description

  await el.save()
  res.redirect('/posts')
})

router.post('/delete-post/:id', isAuthenticated, async function(req, res) {
  let el = await Post.findById(req.params.id)
  let user = getUser(req)
    if (String(el.user) !== String(user._id)) {
      res.redirect('/')
      return
    }

  let a = await Post.findByIdAndDelete(req.params.id)
  res.redirect('/posts')
})

router.get('/posts/:id', isAuthenticated, async function(req, res) {
  let el = await Post.findById(req.params.id)

  res.render('singlepost', {
    title: el.title,
    description: el.description
  })
})

module.exports = router