"use strict";

const os = require('os');
const util = require('util');
const lock = new (require("rwlock"))();
const ffs = require("./feverFS.js");

module.exports = Logger;

function Logger(option = {}) {
    
    this.firstWrite = true;
    
    this.options = {
        console: option.console || false,
        file: option.file || null
    };
    
}

Logger.prototype.log = function (event){
  try {
  
    let self = this;
    let time = timeStamp();
    let isObject = (event === Object(event)); 

    if (self.options.console) {  
      if (isObject) {
        console.log(`${time}`);
        console.log(util.inspect(event, {colors: true, depth: null})); 
      } else {
        console.log(`${time} ${event}`);
      }
    }

    if (self.options.file) {
    
      let flag = (self.firstWrite) ? {'flag':'w'} : {'flag':'a'};
      self.firstWrite = false;
      
      let message;
      
      if (event instanceof Error) {
        message = event;
      } else if (isObject) {
        message = os.EOL + JSON.stringify(event, null, 2);
      } else {
        message = event;
      }
      message = message + os.EOL;
      
      lock.writeLock((release) => {
         ffs.promises.writeFile(self.options.file,`${time} ${message}`,flag)
         .catch((err)=>{
            console.error(err);
         }).finally(()=>{
            release();
         });
      });
    
    }
    
  }catch(err) {
    console.error(err);
  }
}

function timeStamp() {
    let date = new Date();
    let hours = "0" + date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime = `(${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()})` + ' ['+hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ']';
    
    return formattedTime;
}