"use strict";

const path = require('path');
const moment = require("moment");
const ws = require('ws');
const debug = new (require("@xan105/log"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/websocket.log")
});
const test = require("./notification-test.js");

const timeout = 30000; //30sec 

var WebSocket;

module.exports.init = () => {

  WebSocket = new ws.Server({ port: 8082 });
  debug.log("Websocket listening ...");

  WebSocket.on('connection', (client, req) => {
     client.id = req.headers['sec-websocket-key'];
     debug.log(`WS[${client.id}] client connected`);
     client.isAlive = true;
     
     client.on('pong', function(){ this.isAlive = true }); //heartbeat
     client.on('message', incoming);
     client.on('close', function(code, reason){ debug.log(`WS[${this.id}] connection close (${code}) ${reason}`) });
     client.on('error', function(err){ debug.log(`WS[${this.id}] Error: ${err}`) });
  });
  
  WebSocket.on('error', (err) => {
    debug.log(`Server error: ${err}`);
  });
  
  setInterval(() => {
    WebSocket.clients.forEach( (client) => {
      if (client.isAlive === false) {
        debug.log(`WS[${client.id}] closing broken connection`);
        return client.terminate();
      }
      client.isAlive = false;
      client.ping(()=>{}); //noop
    });
  }, timeout);
}

const broadcast = module.exports.broadcast = (message) => {
  try {
    if (WebSocket.clients.size > 0) {
      
      let json = JSON.stringify(message);
      
      WebSocket.clients.forEach( (client) => { 
          try{
            debug.log(`WS[${client.id}] Sending notification`);
            client.send(json);
          }catch(err){
            debug.log(`WS[${client.id}] Error: ${err}`);
          }
      });
    }
   }catch(err){
      debug.log(`Error: ${err}`);
   }
}

function incoming(message){
  try {
     let req;
     try{
       req = JSON.parse(message);
     }catch(err){
       throw new Error(`request is not a valid JSON > ${err}`);
     }

     if (req.cmd === "test") 
     {
        debug.log(`WS[${this.id}] received command 'test'`);
                
        const dummy = {
           appID: 480,
           title: "Achievement Watcher",
           id: "achievement_00",
           message: "Hello World",
           description: "beep boop",
           icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg",
           time: moment().valueOf()
        };
                
        if (req.broadcast === true) {
           broadcast(dummy);       
        } else {
           debug.log(`WS[${this.id}] Sending notification`);
           this.send(JSON.stringify(dummy));
        }
     } 
     else if (req.cmd === "toast-test")
     {
        debug.log(`WS[${this.id}] received command 'toast-test'`);

        test.toast()
          .then(() => {
             this.send(JSON.stringify({
                cmd: "toast-test",
                success: true
             }));
          })
          .catch((err) => {
             this.send(JSON.stringify({
                 cmd: "toast-test",
                 success: false,
                 error: `${err}`
             }));
          });
      }
     else if (req.cmd === "gntp-test")
     {
        debug.log(`WS[${this.id}] received command 'gntp-test'`);

        test.gntp()
          .then(() => {
             this.send(JSON.stringify({
                cmd: "gntp-test",
                success: true
             }));
          })
          .catch((err) => {
             this.send(JSON.stringify({
                 cmd: "gntp-test",
                 success: false,
                 error: `${err}`
             }));
          });
      }
      else
      {
        debug.log(`WS[${this.id}] received unknow command`);
      }
  }catch(err){
    debug.log(`WS[${this.id}] ${err}`);
  }
}