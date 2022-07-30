const { Genre, validate } = require('../model/genre')
const _ = require('lodash')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateObjectId = require('../middleware/validateObjectId')
const validateGenre = require('../middleware/validate')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const genre = await Genre.find().select().sort('name')
  res.send(_.pick(genre, ['_id', 'name']))
})

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id })
  if (!genre) return res.status(404).send('Genre not found!')
  res.send(_.pick(genre, ['_id', 'name']))
})

router.post('/', [auth, admin, validateGenre(validate)], async (req, res) => {
  const genre = new Genre({ name: req.body.name })
  await genre.save()

  res.send(_.pick(genre, ['_id', 'name']))
})

router.put(
  '/:id',
  [auth, validateObjectId, validateGenre(validate)],
  async (req, res) => {
    const update = { name: req.body.name }
    const genre = await Genre.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!genre) return res.status(404).send('Genre not found!')

    res.send(_.pick(genre, ['_id', 'name']))
  },
)

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id)
  if (!genre) return res.status(404).send('Genre not found!')
  res.send(_.pick(genre, ['_id', 'name']))
})

module.exports = router
