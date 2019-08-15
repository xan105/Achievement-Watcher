'use strict';
const symbol = require('get-symbol-from-current-process-h');
const path = require('path');
exports.includeRaw = path.resolve(__dirname, 'include') + ' ' + symbol.includeRaw;
exports.include = exports.includeRaw.replace(/\\/g, '\\\\');
exports.gyp = symbol.gyp;
