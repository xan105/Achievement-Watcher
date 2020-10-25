"use strict";

const path = require('path');
const ffi = require('ffi-napi');

const lib = ffi.Library(path.join(__dirname, "go/build/souvenir.dll"), {
   'capture': ["string", ["string", "string"]],
});

module.exports = function(dirPath, fileName) {
  return new Promise((resolve,reject) => {
    if(!fileName || !dirPath) return reject("Invalid screenshot parameters");

    lib.capture.async(path.resolve(dirPath),fileName, function (err, res) {
        if(err) return reject(err);
        return resolve(res);
    });
  });
}