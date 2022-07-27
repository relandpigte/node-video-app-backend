const mongoose = require('mongoose')
const logger = require('../logger/logger')
const config = require('config')

module.exports = function () {
  const db = config.get('db')
  mongoose
    .connect(db)
    .then(() => logger.log('info', `Connected to the ${db}...`))
}
