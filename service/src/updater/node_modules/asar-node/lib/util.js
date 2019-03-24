const path = require('path')

const mainDir = require.main ? path.dirname(require.main.filename) : process.cwd()

exports.toAbsolute = function (p) {
  return path.isAbsolute(p) ? p : (
    mainDir.indexOf('asar-node' + path.sep + 'bin') === -1 ? path.join(mainDir, p) : path.join(process.cwd(), p)
  )
}

exports.splitPath = function (p) {
  if (typeof p !== 'string') return [false]
  if (p.substr(-5) === '.asar') return [true, p, '']
  const indexWindows = p.lastIndexOf('.asar\\')
  const indexPosix = p.lastIndexOf('.asar/')
  if (indexWindows === -1 && indexPosix === -1) return [false]
  const index = indexPosix === -1 ? indexWindows : indexPosix
  return [true, p.substr(0, index + 5), p.substr(index + 6)]
}
