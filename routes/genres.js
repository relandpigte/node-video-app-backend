const { Genre, validate } = require('../model/genre')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateObjectId = require('../middleware/validateObjectId')
const validateGenre = require('../middleware/validate')

router.get('/', async (req, res) => {
  res.send(await Genre.find().sort('name'))
})

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id })
  if (!genre) return res.status(404).send('Genre not found!')
  res.send(genre)
})

router.post('/', [auth, admin, validateGenre(validate)], async (req, res) => {
  const genre = new Genre({ name: req.body.name })
  res.send(await genre.save())
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

    res.send(genre)
  },
)

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id)
  if (!genre) return res.status(404).send('Genre not found!')
  res.send(genre)
})

module.exports = router
