let Module
try {
  Module = require('module')
} catch (_error) {
  Module = null
}

const path = require('path')
const fs = require('./fs.js')
const { toAbsolute, splitPath } = require('./util.js')

function checkFolder (request, absolutePath) {
  const pkgPath = path.join(absolutePath, 'package.json')
  const indexjs = path.join(absolutePath, 'index.js')
  const indexjson = path.join(absolutePath, 'index.json')
  const indexnode = path.join(absolutePath, 'index.node')
  const indexnodeUnpack = indexnode.replace(/\.asar/, '.asar.unpacked')

  if (fs.existsSync(pkgPath) && fs.statSync(pkgPath).isFile()) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    pkg.main = pkg.main || 'index'
    const main = path.join(absolutePath, pkg.main)
    return checkFilename(request, main)
  } else if (fs.existsSync(indexjs) && fs.statSync(indexjs).isFile()) {
    return indexjs
  } else if (fs.existsSync(indexjson) && fs.statSync(indexjson).isFile()) {
    return indexjson
  } else if (fs.existsSync(indexnode) && fs.existsSync(indexnodeUnpack) && fs.statSync(indexnodeUnpack).isFile()) {
    return indexnodeUnpack
  } else {
    throw new Error('Cannot find module \'' + request + '\'')
  }
}

function checkFilename (request, absolutePath) {
  if (!path.isAbsolute(absolutePath)) throw new Error('Not absolute path.')
  if (path.extname(absolutePath) !== '') {
    if (fs.existsSync(absolutePath)) {
      if (fs.statSync(absolutePath).isDirectory()) return checkFolder(request, absolutePath)
      if (path.extname(absolutePath) === '.node') {
        if (fs.existsSync(absolutePath.replace(/\.asar/, '.asar.unpacked')) && fs.statSync(absolutePath.replace(/\.asar/, '.asar.unpacked')).isFile()) {
          return absolutePath.replace(/\.asar/, '.asar.unpacked')
        }
        throw new Error('Cannot find module \'' + request + '\'')
      }
      return absolutePath
    }
  }
  if (fs.existsSync(absolutePath + '.js') && fs.statSync(absolutePath + '.js').isFile()) return absolutePath + '.js'
  if (fs.existsSync(absolutePath + '.json') && fs.statSync(absolutePath + '.json').isFile()) return absolutePath + '.json'
  if (fs.existsSync(absolutePath + '.node') &&
      fs.statSync(absolutePath + '.node').isFile() &&
      fs.existsSync(absolutePath.replace(/\.asar/, '.asar.unpacked') + '.node') &&
      fs.statSync(absolutePath.replace(/\.asar/, '.asar.unpacked') + '.node').isFile()) return absolutePath.replace(/\.asar/, '.asar.unpacked') + '.node'
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    return checkFolder(request, absolutePath)
  }
  throw new Error('Cannot find module \'' + request + '\'')
}

if (Module && Module._resolveLookupPaths) {
  const oldResolveLookupPaths = Module._resolveLookupPaths
  Module._resolveLookupPaths = function (request, parent, newReturn) {
    const result = oldResolveLookupPaths(request, parent, newReturn)

    const paths = newReturn ? result : result[1]
    let length = paths.length
    for (let i = 0; i < length; i++) {
      if (path.basename(paths[i]) === 'node_modules') {
        paths.splice(i + 1, 0, paths[i] + '.asar')
        length = paths.length
      }
    }

    result._parent = parent

    return result
  }
}

if (Module && Module._findPath) {
  const oldFindPath = Module._findPath
  Module._findPath = function (request, paths, isMain) {
    const parent = paths._parent
    delete paths._parent

    const isInAsar = !!parent && !!parent.filename && (parent.filename.lastIndexOf('.asar') !== -1)

    if (!(path.isAbsolute(request) || request.charAt(0) === '.')) {
      if (isInAsar) {
        if (parent.filename.substr(-5) === '.asar') {
          paths.unshift(path.join(parent.filename, 'node_modules.asar'))
          paths.unshift(path.join(parent.filename, 'node_modules'))
        }

        for (let i = 0; i < paths.length; i++) {
          const target = path.join(paths[i], request)
          try {
            return checkFilename(request, target)
          } catch (_error) {
            continue
          }
        }
        throw new Error('Cannot find module \'' + request + '\'')
      }
    } else {
      if (isInAsar) {
        if (path.isAbsolute(request)) return checkFilename(request, request)
        const absoluteRequest = toAbsolute(path.join(path.extname(parent.filename) === '.asar' ? parent.filename : path.dirname(parent.filename), request))
        return checkFilename(request, absoluteRequest)
      }
    }

    const [isAsar, asarPath, filePath] = splitPath(request)
    if (!isAsar) return oldFindPath.apply(this, arguments)
    if (filePath === '') {
      return toAbsolute(asarPath)
    }

    const absoluteRequest = toAbsolute(request)
    return checkFilename(request, absoluteRequest)
  }
}

if (Module && Module._extensions) {
  Module._extensions['.asar'] = Module._extensions['.asar'] || function asarCompiler (module, filename) {
    const pkgPath = toAbsolute(path.join(filename, 'package.json'))
    const indexjs = toAbsolute(path.join(filename, 'index.js'))
    const indexjson = toAbsolute(path.join(filename, 'index.json'))
    const indexnode = toAbsolute(path.join(filename, 'index.node'))
    const indexnodeUnpack = indexnode.replace(/\.asar/, '.asar.unpacked')
    if (fs.existsSync(pkgPath) && fs.statSync(pkgPath).isFile()) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      pkg.main = pkg.main || 'index'
      const main = toAbsolute(path.join(filename, pkg.main))
      if (path.extname(main) !== '') {
        if (fs.existsSync(main)) return Module._extensions[path.extname(main)](module, main)
        throw new Error('Cannot find module \'' + filename + '\'')
      }
      if (fs.existsSync(main + '.js')) return Module._extensions['.js'](module, main + '.js')
      if (fs.existsSync(main + '.json')) return Module._extensions['.json'](module, main + '.json')
      if (fs.existsSync(main + '.node')) return Module._extensions['.node'](module, main.replace(/\.asar/, '.asar.unpacked') + '.node')
      if (fs.existsSync(main) && fs.statSync(main).isDirectory()) return asarCompiler(module, main)
      throw new Error('Cannot find module \'' + filename + '\'')
    } else if (fs.existsSync(indexjs) && fs.statSync(indexjs).isFile()) {
      return Module._extensions['.js'](module, indexjs)
    } else if (fs.existsSync(indexjson) && fs.statSync(indexjson).isFile()) {
      return Module._extensions['.json'](module, indexjson)
    } else if (fs.existsSync(indexnode) && fs.statSync(indexnode).isFile() && fs.existsSync(indexnodeUnpack) && fs.statSync(indexnodeUnpack).isFile()) {
      return Module._extensions['.node'](module, indexnodeUnpack)
    } else {
      throw new Error('Cannot find module \'' + filename + '\'')
    }
  }
}
