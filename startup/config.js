const config = require('config')
const logger = require('../logger/logger')

module.exports = function () {
  if (!config.get('jwtPrivateKey')) {
    logger.log('info', 'Private key is not defined.')
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.')
  }
}
