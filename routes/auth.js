const { User } = require('../model/user')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  res.send(await User.find().sort('name'))
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).send('User does not exist.')
  res.send(user)
})

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Invalid email or password.')

  const validPassword = bcrypt.compareSync(req.body.password, user.password)
  if (!validPassword) res.status(400).send('Invalid email or password....')

  const token = user.generateAuthToken()
  res.header('x-auth-token', token).send(token)
})

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(50).email().required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{5,30}$'))
      .min(5)
      .max(255)
      .required(),
  })

  return schema.validate(user)
}

module.exports = router
