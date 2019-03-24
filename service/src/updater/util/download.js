const fs = require('fs');
const path = require('path');
const urlParser = require('url');
const http = require('http');
const https = require('https');
const mkdirp = require("mkdirp");
const contentDisposition = require("content-disposition");
 
const MAX_REDIRECT = 10;
const MAX_ERROR = 10;
var REDIRECT = 0;
var ERROR = 0;

module.exports = (url, destDir, callbackProgress = ()=>{} ) => {

    if (Array.isArray(url)) 
    { 
      return downloadList(url, destDir, callbackProgress);
    }
    else 
    {
      return download(url, destDir, callbackProgress);
    }
    
}

module.exports.get = download = (fileURL, destDir, callbackProgress = ()=>{} ) => { 

  return new Promise((resolve, reject) => {
  
    var url = urlParser.parse(fileURL); 
    url.headers = { 'User-Agent': 'Chrome/'};
    var destFile = url.pathname.split('/').pop();
    var destPath = path.join(destDir,destFile);

    var lib = (url.protocol === "https:") ? https : http;
    
      var request = lib.get(url, function (response) { 

      if (response.statusCode >= 200 && response.statusCode < 300) {  
      
        REDIRECT = 0;
        ERROR = 0;

        if(response.headers['content-disposition']) {
           destFile = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
           destPath = path.join(destDir,destFile);
        }
        
          mkdirp(destDir, function (err) {
             if (err) { 
               request.abort();
               return reject(err); 
             }
             else 
             {     
                  var stats = { 
                    size : response.headers['content-length'],
                    speed : [],
                    averageSpeed : 0,
                    time : {
                      started: Date.now(),
                      elapsed : 0,
                      previousElapsed : 0
                    }             
                  };
                  
                  var file = fs.createWriteStream(destPath);

                  file.on('error', function(err) {
                    reject(err);
                    file.end();
                    request.abort();
                  });
                  
                  response.pipe(file);

                  response.on('data', function(data) {
  
                        stats.time.elapsed = Math.floor((Date.now() - stats.time.started) / 1000);
                        if ( stats.time.elapsed >= 1 ) {
                          let currentSpeed = Math.floor((file.bytesWritten / 1000) / stats.time.elapsed);
                          stats.speed.push(currentSpeed);
                          
                          if ( stats.speed.length >= 1 && stats.time.elapsed == stats.time.previousElapsed+1) { 
                            let sum = stats.speed.reduce((a, b) => a + b, 0);
                            stats.averageSpeed = Math.floor(sum / stats.speed.length);
                            stats.speed = [];
                          } 
                        }
                        let percent = Math.floor(100-(((stats.size-file.bytesWritten)/stats.size)*100))
                        callbackProgress(percent, stats.averageSpeed, destFile);
                        stats.time.previousElapsed = stats.time.elapsed;
                        
                  });
                  
                  response.on('end', function() {
                        file.end();
                        callbackProgress(100, 0, destFile);
                        resolve(destPath);
                  });
                  response.on('error', function(err) {
                        reject(err);
                        file.end();
                        request.abort();
                  });
             }
           });
         
         
        } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {

              if (REDIRECT == MAX_REDIRECT) { 
                REDIRECT = 0;
                return reject(`Max. redirect reached (${MAX_REDIRECT})`);
              }
              else {
        
                REDIRECT = REDIRECT + 1;
                
                if (urlParser.parse(response.headers.location).hostname) {
                  var redirect = response.headers.location;
                }
                else {
                  var redirect =`${url.protocol}//${url.hostname}/${response.headers.location}`;
                }
                ERROR = 0;
                return resolve(download(redirect,destDir,callbackProgress));
              
              }
              
        } else {
              request.abort();
        }
      });

      request.setTimeout(3000, function(){
        request.abort();
      });
      request.on('error', function(e){
        request.abort();
        fs.unlink(destPath, () => {});
        ERROR = ERROR + 1;
      
        if (ERROR >= MAX_ERROR ) { 
          ERROR = 0;
          return reject(e); 
        }
        else {
          return resolve(download(fileURL,destDir,callbackProgress));
        }
      });

  });            
}

module.exports.all = downloadList = async (listURL, destDir, callbackProgress = ()=>{} ) => {

  if (!Array.isArray(listURL)) { throw "download file list must be an array !"; }
  
  var count = 0; 
  
  var slice_size = (100/listURL.length);

  var list = [];

  for (file in listURL) { 
    let progressPercent = Math.floor((count/listURL.length)*100);
    try {
      
      if (Array.isArray(destDir)) {
        var destination = destDir[file];
      }
      else {
        var destination = destDir
      }
      
      list.push(await download(listURL[file], destination, function(itemPercent, speed, destFile){  
            let percent = progressPercent + Math.floor((slice_size/100)*itemPercent);
            callbackProgress(percent, speed, destFile);
      })); 
    }
    catch(e) {}
    count = count + 1;
  }
  
  return list;
}