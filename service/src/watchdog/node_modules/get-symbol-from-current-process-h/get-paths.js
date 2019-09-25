'use strict';
const path = require('path');
exports.includeRaw = path.resolve(__dirname, 'include');
exports.include = exports.includeRaw.replace(/\\/g, '\\\\');
exports.gyp = '';
