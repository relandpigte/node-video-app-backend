const express = require('express')
const router = express.Router()
const { Rental } = require('../model/rental')
const { Movie } = require('../model/movie')
const auth = require('../middleware/auth')
const Joi = require('joi')
const validate = require('../middleware/validate')

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId)

  if (!rental) return res.status(404).send('rental not found')

  if (rental.dateReturned)
    return res.status(400).send('return already processed')

  rental.return()
  await rental.save()

  await Movie.updateOne(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } },
  )

  return res.send(rental)
})

function validateReturn(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  })

  return schema.validate(rental)
}

module.exports = router
