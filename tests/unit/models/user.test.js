const { User } = require('../../../model/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('config')

describe('user.generateAuthToken', () => {
  it('Should return a valid JWT', () => {
    const payload = { _id: mongoose.Types.ObjectId(), isAdmin: true }
    const user = new User(payload)
    const token = user.generateAuthToken()
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    expect(decoded).toMatchObject(payload)
  })
})
