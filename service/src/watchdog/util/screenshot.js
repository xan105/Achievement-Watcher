"use strict";

const path = require('path');
const ffi = require('ffi-napi');

const dll = path.join("./souvenir.dll");

const screenshot = ffi.Library(dll, {
   'souvenir': ["string", ["string", "string"]],
});

module.exports = function(gameName,achievementName) {
  return new Promise((resolve,reject) => {
  
    if(!gameName || !achievementName) return reject("Unvalid screenshot parameters");
  
    screenshot.souvenir.async(gameName,achievementName, function (err, res) {
        
        if(err) return reject(err);
        
        try {
          return resolve(path.normalize(res));
        }catch(err){
          return reject(err);
        }
     
    });
  });
}