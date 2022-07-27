const logger = require('../startup/logging')

module.exports = function (err, req, res, next) {
  logger.error(err)
  res.status(500).send('Something went wrong.')
}
