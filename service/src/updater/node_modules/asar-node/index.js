if (process.versions.electron) {
  throw new Error('asar-node can not be used in Electron.')
}

require('./lib/module.js')
