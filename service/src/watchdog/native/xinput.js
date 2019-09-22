"use strict";

const path = require('path');
const ffi = require('ffi-napi');

const dll = path.join("./resources/app.pkg.unpacked/native/vibrate/build/vibrate.dll");
const lib = ffi.Library(dll, {
   'vibrate': ["void", ["int","int","int"]]
});

const xinput = {
  sync: {
    vibrate: (option = {}) => {
    
      let options = {
        slot: option.slot || 0,
        duration: option.duration || 1,
        percent: option.percent || 100
      };

      if (options.slot < 0 || options.slot > 3) throw "xinput valid controller are 0-3";
      if (options.duration <= 0) options.duration = 1;
      if (options.percent < 0 || options.percent > 100) throw "vibration force has a range of 0-100%";
      
      lib.vibrate(options.slot, options.duration, options.percent);    
    
    }
  },
  vibrate: (option = {}) => {
    return new Promise((resolve,reject) => {
      let options = {
        slot: option.slot || 0,
        duration: option.duration || 1,
        percent: option.percent || 100
      };
      
      if (options.slot < 0 || options.slot > 3) return reject("Xinput valid controller are 0-3");
      if (options.duration <= 0) options.duration = 1;
      if (options.percent < 0 || options.percent > 100) return reject("Vibration force has a range of 0-100%");
      
      lib.vibrate.async(options.slot, options.duration, options.percent, function (err, res) {  
          if(err) return reject(err);
          return resolve();
      });
    
    });
  }
}

module.exports = xinput;