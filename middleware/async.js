// Use this if express-async-errors npm don't work
module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (e) {
      next(e)
    }
  }
}
