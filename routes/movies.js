const { Movie, validate } = require('../model/movie')
const { Genre } = require('../model/genre')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateMovie = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', async (req, res) => {
  res.send(await Movie.find().sort('name'))
})

router.get('/:id', [validateObjectId], async (req, res) => {
  const movie = await Movie.findById(req.params.id)
  if (!movie) return res.status(404).send('Genre not found!')
  res.send(movie)
})

router.post('/', [auth, admin, validateMovie(validate)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId)
  if (!genre) return res.status(404).send('Invalid genre.')

  const movie = new Movie({
    title: req.body.title,
    genre: { _id: genre._id, name: genre.name },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  })
  res.send(await movie.save())
})

router.put(
  '/:id',
  [auth, admin, validateObjectId, validateMovie(validate)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId)
    if (!genre) return res.status(404).send('Invalid genre.')

    const update = {
      title: req.body.title,
      genre: { _id: genre._id, name: genre.name },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!movie) return res.status(404).send('Movie not found!')

    res.send(movie)
  },
)

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id)
  if (!movie) return res.status(404).send('Movie not found!')
  res.send(movie)
})

module.exports = router
