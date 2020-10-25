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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports.readFile = (filePath, options) => {
  return new Promise((resolve,reject) => { 
      fs.promises.readFile(filePath, options)
      .then((data) => {
        if (options &&
            (
              ( typeof(options) === "string" && options.toLowerCase().startsWith("utf")) || 
              ( options === Object(options) && options.encoding && options.encoding.toLowerCase().startsWith("utf"))
            ) && data.charCodeAt(0) === 0xFEFF) //BOM
        {
          console.warn(`Stripped UTF BOM from ${filePath}; Use options: {encoding: "utf...", bom: true} with writeFile() to restore it.`);
          return resolve(data.slice(1))
        } else {
          return resolve(data)
        }
      })
      .catch((err) => { return reject(err) });  
  });
}

module.exports.writeFile = (filePath, data, options) => {
  return new Promise((resolve,reject) => {
      fs.promises.mkdir(path.parse(filePath).dir, { recursive: true })
      .then(() => { 
        if (options && typeof(options) !== "string" && options === Object(options)) {
         if (options.bom === true && options.encoding && options.encoding.toLowerCase().startsWith("utf")) data = "\ufeff" + data;
         delete options.bom; //remove custom option
        }
        return fs.promises.writeFile(filePath, data, options) 
      })
      .then(() => { return resolve(filePath) })
      .catch((err) => { return reject(err) });
  });      
}

module.exports.copyFile = function(src, dest, flags) {
  return new Promise((resolve,reject) => {
      fs.promises.mkdir(path.parse(dest).dir, { recursive: true })
      .then(() => { return fs.promises.copyFile(src, dest, flags) })
      .then(() => { return resolve() })
      .catch((err) => { return reject(err) });
  });      
}

module.exports.rm = function(filePath) {
  return new Promise((resolve) => {
     fs.unlink(filePath, () => { return resolve() });    
  });      
}

module.exports.mv = function (oldPath, newPath) {
  return new Promise((resolve, reject) => {
     fs.mkdir(path.parse(newPath).dir, { recursive: true }, function (err) {
            if (err) {
              return reject(err);
            } else { 
              fs.rename(oldPath, newPath, function(err){
                    if (err) {
                        fs.copyFile(oldPath, newPath, function(err) {
                            if (err) {
                              return reject(err);
                            } else {
                              fs.unlink(oldPath, () => { return resolve(newPath) });
                            }
                        });  
                    } else {
                        return resolve(newPath);
                    }
              });
         }
     });
  })
}

module.exports.exists = function (target) {
   return new Promise((resolve) => {
      fs.promises.access(target, fs.constants.F_OK).then(() => resolve(true)).catch(() => resolve(false));
   });
}

module.exports.existsAndIsOlderThan = function (target, option = {}) {

   let options = {
     timeUnit: option.timeUnit || 'd',
     time: option.time || 1,
     younger: option.younger || false
   };

   return new Promise((resolve) => {
      fs.promises.stat(target).then((stats)=>{
          const lifespan = {
            current: new Date().getTime() - stats.mtimeMs,
            get: function(timeUnit) {
                switch(timeUnit) 
                {
                 case 's': return this.current / 1000 //sec
                 case 'm': return this.current / (1000 * 60) //min
                 case 'h': return this.current / (1000 * 60 * 60) //hour
                 case 'd': return this.current / (1000 * 60 * 60 * 24) //day
                 case 'w': return this.current / (1000 * 60 * 60 * 24 * 7) //week
                 case 'M': return this.current / 2628000000 //month
                 case 'Y': return this.current / (2628000000 * 12) //year
                 default: return this.current / (1000 * 60 * 60 * 24) //day
                }
            }
          };
          
          if (options.younger) {
            resolve(lifespan.get(options.timeUnit) <= options.time);  
          } else {
            resolve(lifespan.get(options.timeUnit) >= options.time);
          }
      
      }).catch(() => resolve(false));
   });
}

module.exports.stats = function (target) {
   return new Promise((resolve) => {
      fs.promises.stat(target).then(resolve).catch(() => resolve({}));
   });
}

module.exports.mkdir = (dirPath) => {
  return fs.promises.mkdir(dirPath, { recursive: true });
}

module.exports.rmdir = async function (dirPath) {
  try{
    await fs.promises.rmdir(dirPath);
  }catch(err){
    if (err.code === 'ENOTEMPTY') {
        let files = await fs.promises.readdir(dirPath);
        for (let file of files) 
        {
          let target = path.join(dirPath, file);  

           if ( (await fs.promises.stat(target)).isDirectory() ) {
                 await this.rmdir(target);
           } else {
                 await fs.promises.unlink(path.join(dirPath, file));
           }      
        }
        await this.rmdir(dirPath);        
    }
  }
}

module.exports.hashFile = (filePath, algo = "sha1") => {

  let sum = crypto.createHash(algo);
  let stream = fs.createReadStream(filePath);
  
  return new Promise((resolve, reject) => {
      stream
        .on('error', (err) => {
          return reject(err);
        })
        .on('data', (chunk) => {
          try {
             sum.update(chunk);
          } catch (err) {
             return reject(err);
          }
        })
        .on('end', () => {
          return resolve(sum.digest('hex'));
        });
  });
  
}
