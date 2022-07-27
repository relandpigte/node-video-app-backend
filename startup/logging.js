const logger = require('../logger/logger')
const { transports } = require('winston')

module.exports = function () {
  logger.exceptions.handle(
    new transports.File({ filename: './logs/exceptions.log' }),
  )

  logger.rejections.handle(
    new transports.File({ filename: './logs/rejections.log' }),
  )
}
