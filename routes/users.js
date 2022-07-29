const { User, validate } = require('../model/user')
const validateUser = require('../middleware/validate')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).send('User does not exist.')
  res.send(user)
})

router.post('/', [auth, admin, validateUser(validate)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User already registered.')

  user = new User(_.pick(req.body, ['name', 'email', 'password']))
  const salt = bcrypt.genSaltSync(10)
  user.password = bcrypt.hashSync(req.body.password, salt)
  await user.save()

  const token = user.generateAuthToken()
  res
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(_.pick(user, ['_id', 'name', 'email']))
})

module.exports = router
