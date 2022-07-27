require('express-async-errors')
const Joi = require('joi')

module.exports = function () {
  Joi.objectId = require('joi-objectid')(Joi)
}
