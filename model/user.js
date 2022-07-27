const Joi = require('joi')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('config')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 512,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get('jwtPrivateKey'),
  )

  return token
}

const User = mongoose.model('User', userSchema)

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(50).email().required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{5,30}$'))
      .min(5)
      .max(255)
      .required(),
  })

  return schema.validate(user)
}

exports.User = User
exports.validate = validateUser
