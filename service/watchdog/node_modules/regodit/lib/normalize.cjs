'use strict';

function normalize(path) { return path.replace(/([\/])/g,"\\") }

module.exports = normalize; 