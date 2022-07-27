const express = require('express')
const app = express()
const logger = require('./logger/logger')

require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validation')()
require('./startup/prod')(app)

const port = process.env.PORT || 4000
const server = app.listen(port, () =>
  logger.log('info', `Listening on port ${port}...`),
)

module.exports = server
