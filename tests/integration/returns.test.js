const request = require('supertest')
const { Rental } = require('../../model/rental')
const { Movie } = require('../../model/movie')
const { User } = require('../../model/user')
const mongoose = require('mongoose')
const moment = require('moment')

describe('API: /api/returns', () => {
  let server
  let payload
  let rental
  let token
  let movie

  beforeEach(async () => {
    server = require('../../index')
    token = new User().generateAuthToken()
    payload = {
      customerId: mongoose.Types.ObjectId(),
      movieId: mongoose.Types.ObjectId(),
    }

    movie = new Movie({
      _id: payload.movieId,
      title: '12345',
      dailyRentalRate: 2,
      genre: { name: '123454' },
      numberInStock: 10,
    })
    await movie.save()

    rental = new Rental({
      customer: {
        _id: payload.customerId,
        name: '12345',
        phone: '12345',
      },
      movie: {
        _id: payload.movieId,
        title: '12345',
        dailyRentalRate: 2,
      },
    })

    await rental.save()
  })

  afterEach(async () => {
    await server.close()
    await Rental.deleteMany({})
    await Movie.deleteMany({})
  })

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send(payload)
  }

  it('should return 401 if client is not logged in', async () => {
    const res = await request(server).post('/api/returns').send(payload)

    expect(res.status).toBe(401)
  })

  it('should return 400 customerId is not provided', async () => {
    delete payload.customerId
    const res = await exec()
    expect(res.status).toBe(400)
  })

  it('should return 400 movieId is not provided', async () => {
    delete payload.movieId
    const res = await exec()
    expect(res.status).toBe(400)
  })

  it('should return 404 if no rental found for this customer/movie', async () => {
    await Rental.deleteMany({})
    const res = await exec()

    expect(res.status).toBe(404)
  })

  it('should return 400 rental already processed', async () => {
    rental.dateReturned = new Date()
    rental.save()

    const res = await exec()
    expect(res.status).toBe(400)
  })

  it('should return 200 if it is a valid request', async () => {
    const res = await exec()
    expect(res.status).toBe(200)
  })

  it('should set the returnDate if input is valid', async () => {
    await exec()
    const rentalInDb = await Rental.findById(rental._id)

    const diff = new Date() - rentalInDb.dateReturned
    expect(diff).toBeLessThan(10 * 1000)
  })

  it('should set the rentalFee if input is valid', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate()
    await rental.save()

    await exec()
    const rentalInDb = await Rental.findById(rental._id)

    expect(rentalInDb.rentalFee).toBe(14)
  })

  it('should increase the movie stock', async () => {
    const res = await exec()
    const movieInDb = await Movie.findById(payload.movieId)

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1)
  })

  it('should return the rental if input is valid', async () => {
    const res = await exec()

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'dateOut',
        'dateReturned',
        'rentalFee',
        'customer',
        'movie',
      ]),
    )
  })
})
