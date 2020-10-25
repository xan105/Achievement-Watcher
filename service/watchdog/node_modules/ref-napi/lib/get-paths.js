'use strict';
const symbol = require('get-symbol-from-current-process-h');
exports.includeRaw = [path.resolve(__dirname, '..', 'include')].concat(symbol.includeRaw);
exports.include = exports.includeRaw.map(x => `"${x}"`.replace(/\\/g, '\\\\')).join(' ');
exports.gyp = '';
