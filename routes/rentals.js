const { Rental, validate } = require('../model/rental')
const { Customer } = require('../model/customer')
const { Movie } = require('../model/movie')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const validateRentals = require('../middleware/validate')

router.get('/', async (req, res) => {
  res.send(await Rental.find().sort('-dateOut'))
})

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id)
  if (!rental)
    return res.status(404).send('Rental with the given ID not found.')
  res.send(rental)
})

router.post('/', [auth, validateRentals(validate)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId)
  if (!customer) return res.status(404).send('Invalid customer.')

  const movie = await Movie.findById(req.body.movieId)
  if (!movie) return res.status(404).send('Invalid movie.')

  if (movie.numberInStock === 0)
    return res.status(404).send('Movie not in stock.')

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  })
  rental = await rental.save()

  movie.numberInStock--
  movie.save()

  res.send(rental)
})

module.exports = router
