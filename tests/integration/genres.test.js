const mongoose = require('mongoose')
const request = require('supertest')
const { Genre } = require('../../model/genre')
const { User } = require('../../model/user')
let server

describe('API: /api/genres', () => {
  beforeEach(() => {
    server = require('../../index')
  })

  afterEach(async () => {
    await server.close()
    await Genre.deleteMany({})
  })

  describe('GET /', () => {
    test('It should list all the genres', async () => {
      Genre.collection.insertOne({ name: 'genre1' })
      const res = await request(server).get('/api/genres')

      expect(res.status).toEqual(200)
      expect(res.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      )
      expect(res.body.length).toBe(1)
      expect(res.body.some((g) => g.name === 'genre1')).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('should return a genre if valid ID is passed', async () => {
      const genre = new Genre({ name: 'genre1' })
      await genre.save()

      const res = await request(server).get('/api/genres/' + genre._id)

      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('name', genre.name)
    })

    it('should return 404 if genre ID not found', async () => {
      const id = mongoose.Types.ObjectId()

      const res = await request(server).get('/api/genres/' + id)

      expect(res.status).toEqual(404)
    })
  })

  describe('POST /', () => {
    let token
    let name

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken()
      name = 'genre1'
    })

    const exec = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name })
    }

    test('Return 401 if client is not logged in', async () => {
      token = ''
      const res = await exec()
      expect(res.status).toEqual(401)
    })

    test('Return status of 400 if genre is less than 5 characters', async () => {
      name = '1234'
      const res = await exec()
      expect(res.status).toEqual(400)
    })

    test('Return status of 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a')
      const res = await exec()
      expect(res.status).toEqual(400)
    })

    test('Should save the genre if it is valid', async () => {
      await exec()
      const genre = await Genre.findOne({ name: 'genre1' })
      expect(genre).not.toBeNull()
    })

    test('Should return the genre if it is valid', async () => {
      const res = await exec()
      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('name', 'genre1')
    })
  })

  describe('PUT /:id', () => {
    let token
    let newName
    let id
    let genre

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' })
      await genre.save()

      id = genre._id
      token = new User().generateAuthToken()
      newName = 'newName'
    })

    const exec = () => {
      return request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: newName })
    }

    it('should return 401 if token is not provided', async () => {
      token = ''
      const res = await exec()
      expect(res.status).toBe(401)
    })

    it('should return 404 if genre ID is invalid', async () => {
      id = 0
      const res = await exec()
      expect(res.status).toBe(404)
    })

    it('should return 400 if genre is less than 5 characters', async () => {
      newName = '1234'
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 400 if genre is more than 50 characters', async () => {
      newName = new Array(52).join('a')
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 404 if genre is not found', async () => {
      id = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })

    it('should update the genre if input is valid', async () => {
      await exec()
      const genre = await Genre.findById(id)
      expect(genre.name).toBe(newName)
    })

    it('should return a genre if input is valid', async () => {
      const res = await exec()

      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('name')
    })
  })

  describe('DELETE /:id', () => {
    let token
    let id
    let genre

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' })
      await genre.save()

      id = genre._id
      token = new User({ isAdmin: true }).generateAuthToken()
    })

    const exec = () => {
      return request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token)
        .send()
    }

    it('should return 403 if user is not admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken()
      const res = await exec()
      expect(res.status).toBe(403)
    })

    it('should return 401 if token is not provided', async () => {
      token = ''
      const res = await exec()
      expect(res.status).toBe(401)
    })

    it('should return 404 if genre ID is invalid', async () => {
      id = 1
      const res = await exec()
      expect(res.status).toBe(404)
    })

    it('should return 404 if genre is not found', async () => {
      id = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })

    it('should return the removed genre', async () => {
      const res = await exec()

      expect(res.body).toHaveProperty('_id', id.toHexString())
      expect(res.body).toHaveProperty('name', genre.name)
    })
  })
})
