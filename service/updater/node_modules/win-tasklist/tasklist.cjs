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
'use strict';

const exec = require('child_process').execFile;

const tasklist = module.exports = (option = {}) => {

  let options = {
    verbose: option.verbose || false,
    remote: option.remote || null,
    user: option.user || null,
    password: option.password || null,
    filter: option.filter || []
  };

  return new Promise((resolve, reject) => {
  
    if (process.platform !== 'win32') { return reject("tasklist is a command available only in Microsoft Windows") }
  
    const args = ['/FO', 'CSV', '/NH'];
    
    const regex = `\"([^\\\"]*)\",`;
    
    const pattern = {
      normal: new RegExp(regex.repeat(5).slice(0, -1),"g"),
      verbose: new RegExp(regex.repeat(9).slice(0, -1),"g")
    };

    if (options.verbose) {
      args.push('/V');
    }
    
    if (options.remote && options.user && options.password) {
      args.push('/S', options.remote, '/U', options.user, '/P', options.password);
    }
    
    if (Array.isArray(options.filter)) 
    {
        for (let filter of options.filter) 
        {
          args.push('/FI', filter);
        }
    }
    
    exec("tasklist", args, (err, stdout, stderr) => {
    
      if (err) { return reject(err) }
      if (stderr) { return reject(stderr) }
      
      let list = stdout.match(options.verbose ? pattern.verbose : pattern.normal);
      
      if (list) {
          
          let result = list.map((line) => 
          {
                let data = line.split(",");
                
                let obj = {
                  process: stringify(data[0]),
                  pid: numerify(data[1]), 
                  sessionType: stringify(data[2]),
                  sessionNumber: numerify(data[3]),
                  memUsage: numerify(data[4]) * 1024
                }
                
                if (options.verbose) {
                  obj.state =  stringify(data[5]);
                  obj.user = stringify(data[6]);
                  obj.cpuTime = stringify(data[7]);
                  obj.windowTitle = stringify(data[8]);
                }
                
                return obj;
          
          });
          
          return resolve(result);
        
      } else {
      
          return resolve(null);
          
      }
    
    });
    
  });
  
}

/* Helper function */

module.exports.getProcessInfo = (process, option = {}) => {

  let filter;
  
  if(isNaN(process)){
    filter = `IMAGENAME`;
  } else {
    filter = `PID`;
  }

  option.filter = [`${filter} eq ${process}`];
  
  return tasklist(option); 

}

module.exports.isProcessRunning = async (process, option = {}) => {

  let filter;
  
  if(isNaN(process)){
    filter = `IMAGENAME`;
  } else {
    filter = `PID`;
  }

  option.verbose = false;
  option.filter = [`${filter} eq ${process}`,"STATUS eq RUNNING"];

  return await tasklist(option) ? true : false;
}

module.exports.hasProcess = async (process, option = {}) => {

  let filter;
  
  if(isNaN(process)){
    filter = `IMAGENAME`;
  } else {
    filter = `PID`;
  }

  option.verbose = false;
  option.filter = [`${filter} eq ${process}`];

  return await tasklist(option) ? true : false;
}

/* Private function */

function stringify(str) {
  if (str) {
    return str.toLowerCase().replace(/(\")*/g,"");
  }
}

function numerify(str) {
  if (str) {
    return Number(str.toLowerCase().replace(/[^\d]/g, ''));
  }
}