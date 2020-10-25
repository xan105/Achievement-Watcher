"use strict";

const net = require('net');
const growly = require('growly');

module.exports.hasGrowl = (option = {}) => {
  return new Promise((resolve) => {
  
    let hasGrowl = false;
  
    try {
    
      let options = {
        host: option.host || 'localhost',
        port: option.port || 23053
      }
    
      let socket = net.connect(options.port, options.host);
      socket.setTimeout(100);

      socket.on('connect', function() {
        socket.end();
        hasGrowl = true
        return resolve(hasGrowl);
      });

      socket.on('error', function() {
        socket.end();
        hasGrowl = false
        return resolve(hasGrowl);
      });
    
    }catch(err){
      return resolve(hasGrowl);
    }
   
  });
}

module.exports.send = (option = {}) => {
  return new Promise((resolve,reject) => {
    try {
    
      let options = {
          host: option.host || 'localhost',
          port: option.port || 23053,
          title: option.title || '',
          message: option.message || '',
          icon: option.icon || ''    
      }
      
      growly.setHost(options.host, options.port);
      
      growly.register('Achievement Watcher', './icon.png', [
            { label: 'Achievement', dispname: 'Achievement', enabled: true }
        ], function(err) {
            if (err) return reject(err);
            
            growly.notify(options.message, { label: 'Achievement', title: options.title, icon: options.icon }, function(err, action) {});
            return resolve();  //We don't wait
            
      });
    
    }catch(err){
      return reject(err);
    }
  });
}