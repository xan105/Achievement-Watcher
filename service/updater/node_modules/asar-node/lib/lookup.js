
let lookupAsar = false

function addAsarToLookupPaths () {
  if (lookupAsar) return
  let Module
  try {
    Module = require('module')
  } catch (_error) {
    Module = null
  }

  if (Module && typeof Module._resolveLookupPaths === 'function') {
    const resolvePaths = function resolvePaths (paths) {
      for (let i = 0; i < paths.length; i++) {
        if (require('path').basename(paths[i]) === 'node_modules') {
          paths.splice(i + 1, 0, paths[i] + '.asar')
          i++
        }
      }
    }
    const oldResolveLookupPaths = Module._resolveLookupPaths
    Module._resolveLookupPaths = oldResolveLookupPaths.length === 2 ? function (request, parent) {
      const result = oldResolveLookupPaths.call(this, request, parent)
      if (!result) return result

      resolvePaths(result)

      return result
    } : function (request, parent, newReturn) {
      const result = oldResolveLookupPaths.call(this, request, parent, newReturn)

      const paths = newReturn ? result : result[1]
      resolvePaths(paths)

      return result
    }
    lookupAsar = true
  }
}

function checkLookupState () {
  return lookupAsar
}

exports.addAsarToLookupPaths = addAsarToLookupPaths
exports.checkLookupState = checkLookupState
