const lookup = require('./lib/lookup.js')
const register = require('./lib/register.js')

function getState () {
  return {
    lookupAsar: lookup.checkLookupState(),
    registered: register.checkRegisterState()
  }
}

exports.addAsarToLookupPaths = lookup.addAsarToLookupPaths
exports.register = register.register
exports.getState = getState
