"use strict";

const path = require('path');
const net = require('net');
const growly = require('growly');

function hasGrowl(option = {}){
  return new Promise((resolve) => {
  
    let hasGrowl = false;
  
    try {
    
      const options = {
        host: option.host || 'localhost',
        port: option.port || 23053
      };
    
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

function send(option = {}){
  return new Promise((resolve,reject) => {
    try {
    
      const options = {
          host: option.host || 'localhost',
          port: option.port || 23053,
          title: option.title || '',
          message: option.message || '',
          icon: option.icon || '',
          label: option.label || 'Achievement'    
      };
      
      growly.setHost(options.host, options.port);

	  growly.register('Achievement Watcher', path.resolve("./notification/icon/icon.png"), [
		{ label: 'Achievement', dispname: 'Achievement', enabled: true },
		{ label: 'Playtime', dispname: 'Playtime', enabled: true }
	  ], function(err) {
		if (err) return reject(err);
				
		growly.notify(options.message, { label: options.label, title: options.title, icon: options.icon }, ()=>{});
		return resolve();  //We don't wait
				
	  });
      
    }catch(err){
      return reject(err);
    }
  });
}

module.exports = { hasGrowl, send }