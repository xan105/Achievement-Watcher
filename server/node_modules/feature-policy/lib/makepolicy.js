var config = require('./config')

module.exports = function makePolicy (options) {
  return Object.keys(options.features).map(function (featureKey) {
    const dasherizedKey = config.features[featureKey]
    return [dasherizedKey].concat(options.features[featureKey]).join(' ')
  }).join(';')
}
