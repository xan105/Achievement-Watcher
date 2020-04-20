/*
MIT License

Copyright (c) 2020 Anthony Beaumont

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
          file: option.file || null
      };
      
      if(this.options.file) {
        fs.mkdirSync(path.parse(this.options.file).dir, { recursive: true });
        this.stream = fs.createWriteStream(this.options.file, 'utf-8')
        .on('error', function (err) {
              console.error(err);
        });
      }
    }
    
    log(event) {

      const time = timeStamp();
      
      if(this.options.console) 
      {
          if(event === Object(event)) {
            const msg = `${code.bright}${time}${code.reset}${os.EOL}` + util.inspect(event, {colors: true, depth: null});
            (event instanceof Error) ? console.error(msg) : console.log(msg);
          } else {
            console.log(`${code.bright}${time}${code.reset} ${event}`);
          }
      }
      
      if(this.options.file) 
      {
          if(!(event instanceof Error) && event === Object(event)) {
              this.stream.write(`${time}${os.EOL}` + JSON.stringify(event, null, 2) + os.EOL); 
           } else {
              this.stream.write(`${time} ${event}${os.EOL}`);
           }
      }
      
    }
}

function timeStamp() {
    const date = new Date();
    let hour = "0" + date.getHours();
    let min = "0" + date.getMinutes();
    let sec = "0" + date.getSeconds();
    let ms = "00" + date.getMilliseconds();
    return `(${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}) [${hour.substr(-2)}:${min.substr(-2)}:${sec.substr(-2)}.${ms.substr(-3)}]`;
}

module.exports = Logger;