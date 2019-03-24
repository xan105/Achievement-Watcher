var checkOptions = require('./lib/checkoptions')
var makePolicy = require('./lib/makepolicy')

module.exports = function featurePolicy (options) {
  checkOptions(options)

  var policy = makePolicy(options)

  return function featurePolicy (req, res, next) {
    res.setHeader('Feature-Policy', policy)
    next()
  }
}
