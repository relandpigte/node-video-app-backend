const request = require('supertest')
const { User } = require('../../model/user')
const { Genre } = require('../../model/genre')

describe('auth middleware', () => {
  let token

  beforeEach(() => {
    server = require('../../index')
    token = new User({ isAdmin: true }).generateAuthToken()
  })

  afterEach(async () => {
    await server.close()
    await Genre.deleteMany({})
  })

  const exec = () => {
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' })
  }

  it('should return 403 user is not admin', async () => {
    token = new User({ isAdmin: false }).generateAuthToken()
    const res = await exec()
    expect(res.status).toEqual(403)
  })

  it('should return 401 if no token is provided', async () => {
    token = ''
    const res = await exec()
    expect(res.status).toEqual(401)
  })

  it('should return 400 if no token is invalid', async () => {
    token = 'a'
    const res = await exec()
    expect(res.status).toEqual(400)
  })

  it('should return 200 if no token is valid', async () => {
    const res = await exec()
    expect(res.status).toEqual(200)
  })
})
