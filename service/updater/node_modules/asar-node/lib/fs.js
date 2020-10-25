const nodeRequire = require('./require.js')()
const fs = process.versions.electron ? nodeRequire('original-fs') : require('fs')
const asar = require('./asar.js')
const asarDisk = asar.disk
const path = require('path')
const pickle = require('./pickle')
const { splitPath } = require('./util.js')

let nextInode = 0
const uid = process.getuid != null ? process.getuid() : 0
const gid = process.getgid != null ? process.getgid() : 0
const fakeTime = new Date()
const asarStatsToFsStats = (stats) => {
  const isFile = !stats.files
  return {
    dev: 1,
    ino: ++nextInode,
    mode: 33188,
    nlink: 1,
    uid: uid,
    gid: gid,
    rdev: 0,
    atime: stats.atime || fakeTime,
    birthtime: stats.birthtime || fakeTime,
    mtime: stats.mtime || fakeTime,
    ctime: stats.ctime || fakeTime,
    size: stats.size,
    isFile: () => isFile,
    isDirectory: () => !isFile,
    isSymbolicLink: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false
  }
}

// Start overriding fs methods.
const readFileSync = fs.readFileSync
fs.readFileSync = function (p, options) {
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return readFileSync.apply(this, arguments)

  if (!options) {
    options = { encoding: null, flag: 'r' }
  } else if (typeof options === 'string') {
    options = { encoding: options, flag: 'r' }
  } else if (typeof options !== 'object') {
    throw new TypeError('Bad arguments')
  }

  let content
  try {
    content = asar.extractFile(asarPath, filePath)
  } catch (_error) {
    throw new Error('ENOENT: no such file or directory, open \'' + p + '\'')
  }
  if (options.encoding) {
    return content.toString(options.encoding)
  } else {
    return content
  }
}

const createReadStream = fs.createReadStream
fs.createReadStream = function (p, options) {
  if (!p || (options && options.fd)) return createReadStream.apply(this, arguments)
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return createReadStream.apply(this, arguments)

  const fd = fs.openSync(asarPath, 'r')

  const sizeBuf = Buffer.alloc(8)
  if (fs.readSync(fd, sizeBuf, 0, 8, null) !== 8) {
    throw new Error('Unable to read header size')
  }

  const sizePickle = pickle.createFromBuffer(sizeBuf)
  let headerSize = sizePickle.createIterator().readUInt32()

  let stats
  try {
    stats = asar.statFile(asarPath, filePath)
  } catch (_error) {
    throw new Error('Not found \'' + p + '\'')
  }

  let defaultOption = {
    fd,
    autoClose: true,
    start: 8 + headerSize + parseInt(stats.offset, 10),
    end: 8 + headerSize + parseInt(stats.offset, 10) + stats.size - 1
  }

  if (Object.prototype.toString.call(options) === '[object Object]') {
    if (typeof options.end === 'number') {
      defaultOption.end = defaultOption.start + options.end
      delete options.end
    }
    if (typeof options.start === 'number') {
      defaultOption.start += options.start
      delete options.start
    }
    options = Object.assign({}, defaultOption, options)
  } else {
    options = defaultOption
  }

  return createReadStream('', options)
}

const statSync = fs.statSync
fs.statSync = function (p) {
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return statSync.apply(this, arguments)
  return asarStatsToFsStats(asar.statFile(asarPath, filePath, true))
}

const lstatSync = fs.lstatSync
fs.lstatSync = function (p) {
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return lstatSync.apply(this, arguments)
  return asarStatsToFsStats(asar.statFile(asarPath, filePath))
}

const readdirSync = fs.readdirSync
fs.readdirSync = function (p) {
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar) return readdirSync.apply(this, arguments)
  const filesystem = asarDisk.readFilesystemSync(asarPath)
  let node
  try {
    node = filesystem.getNode(filePath)
    if (!node) throw new Error()
  } catch (_) {
    throw new Error('ENOENT: no such file or directory, asar readdirSync \'' + p + '\'')
  }
  if (node.files) {
    return Object.keys(node.files)
  }
  throw new Error('ENOTDIR: not a directory, asar readdirSync \'' + p + '\'')
}

const existsSync = fs.existsSync
fs.existsSync = function (p) {
  const [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return existsSync.apply(this, arguments)
  try {
    asar.statFile(asarPath, filePath)
    return true
  } catch (_error) {
    return false
  }
}

const realpathSync = fs.realpathSync
fs.realpathSync = function (p) {
  let [isAsar, asarPath, filePath] = splitPath(p)
  if (!isAsar || filePath === '') return realpathSync.apply(this, arguments)
  const stat = asar.statFile(asarPath, filePath)
  if (stat.link) filePath = stat.link
  return path.join(realpathSync(asarPath), filePath)
}

module.exports = fs
