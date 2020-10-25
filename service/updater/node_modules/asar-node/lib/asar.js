// Extract from asar 2.0.3
const nodeRequire = require('./require.js')()
const path = require('path')
const fs = process.versions.electron ? nodeRequire('original-fs') : require('fs')
const pickle = require('./pickle')
// const UINT64 = require('cuint/lib/uint64.js')

class Filesystem {
  constructor (src) {
    this.src = path.resolve(src)
    this.header = { files: {} }
    // this.offset = UINT64(0)
  }

  searchNodeFromDirectory (p) {
    let json = this.header
    const dirs = p.split(path.sep)
    for (const dir of dirs) {
      if (dir !== '.') {
        json = json.files[dir]
      }
    }
    return json
  }

  searchNodeFromPath (p) {
    p = path.relative(this.src, p)
    if (!p) { return this.header }
    const name = path.basename(p)
    const node = this.searchNodeFromDirectory(path.dirname(p))
    if (node.files == null) {
      node.files = {}
    }
    if (node.files[name] == null) {
      node.files[name] = {}
    }
    return node.files[name]
  }

  insertDirectory (p, shouldUnpack) {
    const node = this.searchNodeFromPath(p)
    if (shouldUnpack) {
      node.unpacked = shouldUnpack
    }
    node.files = {}
    return node.files
  }

  listFiles (options) {
    const files = []
    const fillFilesFromHeader = function (p, json) {
      if (!json.files) {
        return
      }
      return (() => {
        const result = []
        for (const f in json.files) {
          const fullPath = path.join(p, f)
          const packState = json.files[f].unpacked === true ? 'unpack' : 'pack  '
          files.push((options && options.isPack) ? `${packState} : ${fullPath}` : fullPath)
          result.push(fillFilesFromHeader(fullPath, json.files[f]))
        }
        return result
      })()
    }

    fillFilesFromHeader('/', this.header)
    return files
  }

  getNode (p) {
    const node = this.searchNodeFromDirectory(path.dirname(p))
    const name = path.basename(p)
    if (name) {
      return node.files[name]
    } else {
      return node
    }
  }

  getFile (p, followLinks) {
    followLinks = typeof followLinks === 'undefined' ? true : followLinks
    const info = this.getNode(p)

    // if followLinks is false we don't resolve symlinks
    if (info.link && followLinks) {
      return this.getFile(info.link)
    } else {
      return info
    }
  }
}

let filesystemCache = {}

function extractFile (archive, filename) {
  const filesystem = readFilesystemSync(archive)
  return readFileSync(filesystem, filename, filesystem.getFile(filename))
}

function statFile (archive, filename, followLinks) {
  const filesystem = readFilesystemSync(archive)
  return filesystem.getFile(filename, followLinks)
}

function readFileSync (filesystem, filename, info) {
  let buffer = Buffer.alloc(info.size)
  if (info.size <= 0) { return buffer }
  if (info.unpacked) {
    // it's an unpacked file, copy it.
    buffer = fs.readFileSync(path.join(`${filesystem.src}.unpacked`, filename))
  } else {
    // Node throws an exception when reading 0 bytes into a 0-size buffer,
    // so we short-circuit the read in this case.
    const fd = fs.openSync(filesystem.src, 'r')
    try {
      const offset = 8 + filesystem.headerSize + parseInt(info.offset)
      fs.readSync(fd, buffer, 0, info.size, offset)
    } finally {
      fs.closeSync(fd)
    }
  }
  return buffer
}

function readArchiveHeaderSync (archive) {
  const fd = fs.openSync(archive, 'r')
  let size
  let headerBuf
  try {
    const sizeBuf = Buffer.alloc(8)
    if (fs.readSync(fd, sizeBuf, 0, 8, null) !== 8) {
      throw new Error('Unable to read header size')
    }

    const sizePickle = pickle.createFromBuffer(sizeBuf)
    size = sizePickle.createIterator().readUInt32()
    headerBuf = Buffer.alloc(size)
    if (fs.readSync(fd, headerBuf, 0, size, null) !== size) {
      throw new Error('Unable to read header')
    }
  } finally {
    fs.closeSync(fd)
  }

  const headerPickle = pickle.createFromBuffer(headerBuf)
  const header = headerPickle.createIterator().readString()
  return { header: JSON.parse(header), headerSize: size }
}

function readFilesystemSync (archive) {
  if (!filesystemCache[archive]) {
    const header = readArchiveHeaderSync(archive)
    const filesystem = new Filesystem(archive)
    filesystem.header = header.header
    filesystem.headerSize = header.headerSize
    filesystemCache[archive] = filesystem
  }
  return filesystemCache[archive]
}

exports.extractFile = extractFile
exports.statFile = statFile
exports.disk = {
  readFilesystemSync
}
