"use strict";

const path = require('path');
const moment = require("moment");
const WebSocket = new (require('ws')).Server({ port: 8082 });
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/websocket.log")
});

const timeout = 30000; //30sec 

module.exports.init = () => {

  WebSocket.on('connection', (client, req) => {
     client.id = req.headers['sec-websocket-key'];
     debug.log(`[${client.id}] client connected`);
     client.isAlive = true;
     
     client.on('pong', function(){ this.isAlive = true }); //heartbeat
     client.on('message', incoming);
     client.on('close', function(code, reason){ debug.log(`[${this.id}] connection close (${code}) ${reason}`) });
     client.on('error', function(error){ debug.log(`[${this.id}] error: ${err}`) });
  });
  
  WebSocket.on('error', (err) => {
    debug.log(`Server error: ${err}`);
  });
  
  setInterval(() => {
    WebSocket.clients.forEach( (client) => {
      if (client.isAlive === false) {
        debug.log(`[${client.id}] closing broken connection`);
        return client.terminate();
      }
      client.isAlive = false;
      client.ping(()=>{}); //noop
    });
  }, timeout);
}

module.exports.broadcast = (message) => {
  try {
    if (WebSocket.clients.size > 0) {
      
      let json = JSON.stringify(message);
      
      WebSocket.clients.forEach( (client) => { 
          try{
            debug.log(`[${client.id}] Sending notification`);
            client.send(json);
          }catch(err){
            debug.log(`[${client.id}] error: ${err}`);
          }
      });
    }
   }catch(err){
      debug.log(`error: ${err}`);
   }
}

function incoming(message){
          let req = {};
          
          try {
            req = JSON.parse(message);
          }catch(err){
            debug.log(`[${this.id}] request is not a valid JSON: ${err}`);
            return;
          }

          if (req.cmd === "test") {
              try {
              
                const dummy = JSON.stringify({
                         appID: 480,
                         title: "Achievement Watcher",
                         id: "achievement_00",
                         message: "Hello World",
                         description: "beep boop",
                         icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg",
                         time: moment().valueOf()
                });
                
                if (req.broadcast === true) {
                    debug.log("[All] Sending dummy notification");
                    WebSocket.clients.forEach( (client) => { 
                      try{
                        client.send(dummy);
                      }catch(err){
                        debug.log(`[${client.id}] error: ${err}`);
                      }
                    });
                } else {
                    debug.log(`[${this.id}] Sending dummy notification`);
                    this.send(dummy);
                }
              
             }catch(err){
                debug.log(`[${this.id}] error: ${err}`);
             }
          }
}