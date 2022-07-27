const { Customer, validate } = require('../model/customer')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/', async (req, res) => {
  res.send(await Customer.find().sort('name'))
})

router.get('/:id', auth, async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) return res.status(404).send('Customer not found!')
  res.send(customer)
})

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let customer = {
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  }
  customer = new Customer(customer)
  res.send(await customer.save())
})

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let customer = {
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  }
  customer = await Customer.findByIdAndUpdate(req.params.id, customer, {
    new: true,
  })
  if (!customer) return res.status(404).send('Customer not found!')

  res.send(customer)
})

router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id)
  if (!customer) return res.status(404).send('Customer not found!')
  res.send(customer)
})

module.exports = router
