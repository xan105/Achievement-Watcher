/*
MIT License

Copyright (c) 2019-2020 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";

const os = require('os');
const fs = require('fs');
const util = require('util');
const path = require('path');

const code = {
  reset : "\x1b[0m",
  bright : "\x1b[1m",
  dim : "\x1b[2m",
  underscore : "\x1b[4m",
  blink : "\x1b[5m",
  reverse : "\x1b[7m",
  hidden : "\x1b[8m",
  black : "\x1b[30m",
  grey : "\x1b[90m",
  red : "\x1b[31m",
  green : "\x1b[32m",
  yellow : "\x1b[33m",
  blue : "\x1b[34m",
  magenta : "\x1b[35m",
  cyan : "\x1b[36m",
  white : "\x1b[37m",
  bgBlack : "\x1b[40m",
  bgRed : "\x1b[41m",
  bgGreen : "\x1b[42m",
  bgYellow : "\x1b[43m",
  bgBlue : "\x1b[44m",
  bgMagenta : "\x1b[45m",
  bgCyan : "\x1b[46m",
  bgWhite : "\x1b[47m"
};

class Logger {
    constructor(option = {}) {
      this.options = {
          console: option.console || false,
          file: option.file || null,
          appendToFile: option.appendToFile || false
      };
      
      if(this.options.file) {
        fs.mkdirSync(path.parse(this.options.file).dir, { recursive: true });
        this.stream = fs.createWriteStream(this.options.file, { flags: (this.options.appendToFile === true) ? "a" : "w", encoding: "utf8"})
        .on('error', function (err) {
              console.warn(err);
        });
      }
    }
    
    log(event, level = "info") {

      const levels = {
        info : { prefix: "INFO", color: code.bright },
        warn : { prefix: "WARN", color: code.bright + code.yellow },
        error : { prefix: "FAIL", color: code.bright + code.red }
      };
      
      if ( !Object.keys(levels).includes(level) ) level = "info";

      const time = timeStamp();

      if(this.options.console) 
      {
          if (typeof window !== 'undefined' && typeof window.document !== 'undefined') //Browser (electron,NW.js,...)
          {
            const header = `%c[${time.hms}%c${time.ms}%c]%c`;
            const css = ["font-weight:bold","color: grey","color: inherit; font-weight:bold","font-weight:initial"];
            const msg = (event === Object(event)) ? `${header} ${os.EOL}` + util.inspect(event, {colors: true, depth: null}) : `${header} ${event}`;
            
            if (event instanceof Error || level === "error") {
              console.error(msg,...css);
            } else if (level === "warn") {
              console.warn(msg,...css);
            } else {
              css[0] += ";padding-left:10px";
              console.log(msg,...css);
            } 
            
          } 
          else 
          {
            const header = `${code.bright}[${time.hms}${code.grey}${time.ms}${code.reset} ${levels[level].color}${levels[level].prefix}${code.white}]${code.reset}`;
            const msg = (event === Object(event)) ? `${header} ${os.EOL}` + util.inspect(event, {colors: true, depth: null}) : `${header} ${event}`;
            
            if (event instanceof Error || level === "error") {
              console.error(msg);
            } else if (level === "warn") {
              console.warn(msg);
            } else {
              console.log(msg);
            } 
            
          }
      }
      
      if(this.options.file) 
      {
          const header = `[${time.full} ${levels[level].prefix}]`;
          
          if(event === Object(event)) 
          {
              if (event instanceof Error) {
                this.stream.write(`${header}${os.EOL}` + event.stack + os.EOL);
              } else {
                this.stream.write(`${header}${os.EOL}` + JSON.stringify(event, null, 2) + os.EOL);
              } 
          } 
          else 
          {
              this.stream.write(`${header} ${event}${os.EOL}`);
          }
      }
      
    }
    
    warn(event) {
      this.log(event,"warn");
    }
    
    error(event) {
      this.log(event,"error");
    }
}

function timeStamp() {
    const date = new Date();
    const dmy = `${("0"+date.getDate()).substr(-2)}/${("0"+(date.getMonth()+1)).substr(-2)}/${date.getFullYear() % 100}`;
    const hms = `${("0"+date.getHours()).substr(-2)}:${("0"+date.getMinutes()).substr(-2)}:${("0"+date.getSeconds()).substr(-2)}`;
    const ms = `.${("00"+date.getMilliseconds()).substr(-3)}`;
    return { date: dmy, hms: hms, ms: ms, full: `${dmy} ${hms}${ms}`}
}

module.exports = Logger;