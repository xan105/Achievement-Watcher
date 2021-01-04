'use strict';

const path = require('path');
const debug = new (require("@xan105/log"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/notification.log")
});

module.exports = debug;