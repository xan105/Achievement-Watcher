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

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const urlParser = require('url');
const torrent = require('./torrent.cjs');

const download = module.exports = (href, destDir, option, callbackProgress = ()=>{} ) => { 

  if (typeof option === 'function') {
		callbackProgress = option
		option = null;
	}
	
	if (!option) option = {};
	
	let options = {
    timeout : option.timeout || 3000,
    maxRedirect: (option.maxRedirect || option.maxRedirect == 0) ? option.maxRedirect : 3,
    maxRetry: (option.maxRetry || option.maxRetry == 0) ? option.maxRetry : 3,
    retryDelay: option.retryDelay || 500,
    headers : {
      'User-Agent': 'Chrome/'
    },
    filename: option.filename || null
  };
  
  if (option.headers) {
    Object.assign(options.headers,option.headers);
  }

  return new Promise((resolve, reject) => {

    if (typeof href !== "string" && !Array.isArray(href)) return reject( {code:"ERR_INVALID_ARG_TYPE", message:`URL is not a string. Received ${typeof(href)}`} );
    if(Array.isArray(href) && !href.every(url => typeof url === "string")) return reject( {code:"UNEXPECTED_URL_ARRAY", message:"URL as an array is only used internally and should be made only of strings !"} );
    
    if (!destDir || typeof(destDir) !== 'string') return reject( {code:"ERR_INVALID_ARG_TYPE", message:`destDir is ${typeof(destDir)}`} )
  
    if (!Array.isArray(href) && typeof href === "string") href = [href];
    let url = urlParser.parse(href[href.length-1]);
    
    if(!url.hostname || !url.protocol) return reject( {code:"BAD_URL", message:`URL is malformed. Received: "${href}"`} );
    url.headers = options.headers;
    
    let destPath = '';
    
    const lib = (url.protocol === "https:") ? https : http;
    let req = lib.get(url, (res) => {

      if (res.statusCode >= 200 && res.statusCode < 300) {  
      
        let destFile; 
        
        if (options.filename) {
          destFile = options.filename;
        } else {
          try {
          
            const regexp = [
              /filename\*=UTF-8\'\'(.*)/,
              /filename=\"(.*)\"/,
              /filename=(.*)/
            ];
            
            for (let exp of regexp) {
              let matches = res.headers['content-disposition'].match(exp);
              if (matches && matches.length >= 2 && matches[1]) {
                destFile = matches[1];
                break;
              }
            }
            
            if (!destFile) throw "Unable to parse content-disposition";
          }catch(err){
            destFile = url.pathname.split('/').pop();
          }
        }

        destPath = path.join(destDir,destFile);
        
          fs.mkdir(destDir, { recursive: true }, (err) => {
             if (err) { 
               reject( {code: err.code, message: err.message, url: url.href, trace: href} );
               req.destroy(); 
             }
             else 
             {     
                  let stats = { 
                    size : res.headers['content-length'],
                    speed : [],
                    averageSpeed : 0,
                    time : {
                      started: Date.now(),
                      elapsed : 0,
                      previousElapsed : 0
                    }             
                  };
                  
                  let file = fs.createWriteStream(destPath);

                  file.on('error', (err) => {
                    reject( {code: err.code, message: err.message, url: url.href, trace: href} );
                    file.end();
                    fs.unlink(destPath, () => {
                       req.destroy();
                    });
                  });
                  
                  res.pipe(file);

                  res.on('data', () => {
  
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
                        
                  }).on('end', () => {
                  
                      file.on('close', () => {
                        if (res.complete) {
                              fs.stat(destPath, (err, stats) => {
                                  if (!err && stats.size === +res.headers['content-length']) 
                                  {
                                    callbackProgress(100, 0, destFile);
                                    resolve({
                                        code: res.statusCode,
                                        message: res.statusMessage,
                                        url: url.href,
                                        trace: href,
                                        headers: res.headers,
                                        path: destPath
                                    });
                                  } 
                                  else 
                                  {
                                    option.maxRetry = options.maxRetry - 1;
                                    if (option.maxRetry < 0) {
                                        reject({
                                          code: 'ESIZEMISMATCH', 
                                          message: 'Unexpected file size', 
                                          url: url.href,
                                          trace: href,
                                          headers: res.headers
                                          });
                                        fs.unlink(destPath, () => {});
                                    } else {
                                        setTimeout(function(){
                                           return resolve(download(href, destDir, option, callbackProgress));
                                        }, options.retryDelay);
                                    }  
                                  }
                              });
                        } else {
                            option.maxRetry = options.maxRetry - 1;
                            if (option.maxRetry < 0) {
                                reject({
                                  code: 'EINTERRUPTED',
                                  message: 'The connection was terminated while the message was still being sent', 
                                  url: url.href,
                                  trace: href,
                                  headers: res.headers
                                });
                                fs.unlink(destPath, () => {});
                            } else {
                                setTimeout(function(){
                                   return resolve(download(href, destDir, option, callbackProgress));
                                }, options.retryDelay);
                            }                         
                        }
                      });
                      file.end();
    
                  }).on('error', (err) => {
                  
                        file.end();
                        option.maxRetry = options.maxRetry - 1;
                        if (option.maxRetry < 0) {
                          reject({
                              code: err.code, 
                              message: err.message,
                              url: url.href,
                              trace: href,
                              headers: res.headers
                          });
                          fs.unlink(destPath, () => {
                              req.destroy();
                          });    
                        }else {
                           setTimeout(function(){
                              return resolve(download(href, destDir, option, callbackProgress));
                           }, options.retryDelay);
                        } 
                        
                  });
             }
           });
         
        } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {

              option.maxRedirect = options.maxRedirect - 1;
              if (option.maxRedirect < 0) {
                return reject({
                  code:"EREDIRECTMAX", 
                  message:"Maximum redirection reached",
                  url: url.href,
                  trace: href,
                  headers: res.headers
                });
              } else {
                let redirect = (urlParser.parse(res.headers.location).hostname) ? res.headers.location : new urlParser.URL(res.headers.location,`${url.protocol}//${url.hostname}`).href;
                href.push(redirect);
                return resolve(download(href, destDir, option, callbackProgress));
              }
              
        } else {

             option.maxRetry = options.maxRetry - 1;
             if (option.maxRetry < 0) {
                 reject({
                    code: res.statusCode, 
                    message: res.statusMessage,
                    url: url.href,
                    trace: href,
                    headers: res.headers
                 });
                 fs.unlink(destPath, () => {
                    req.destroy();
                 });    
             } else {
                 setTimeout(function(){
                    return resolve(download(href, destDir, option, callbackProgress));
                 }, options.retryDelay);
             } 
              
        }
        
      }).setTimeout(options.timeout, () => {
          req.destroy();
      }).on('error', (err) => {
             option.maxRetry = options.maxRetry - 1;
             if (option.maxRetry < 0) {
                 reject({
                    code: err.code, 
                    message: err.message,
                    url: url.href,
                    trace: href
                 });
                 fs.unlink(destPath, () => {
                    req.destroy();
                 });    
             } else {
                 setTimeout(function(){
                    return resolve(download(href, destDir, option, callbackProgress));
                 }, options.retryDelay);
             }        
      });
      
      req.end();
  });            
}

module.exports.all = async (listURL, destDir, option, callbackProgress = ()=>{} ) => {

  if (!Array.isArray(listURL)) { throw "download file list must be an array !"; }
  
  if (typeof option === 'function') {
		callbackProgress = option
		option = null;
	}
	
	if (!option) option = {};
  
  let count = 0; 
  let slice_size = (100/listURL.length);
  let list = [];

  for (let file in listURL) 
  { 
  
    let _option = JSON.parse(JSON.stringify(option));
  
    let progressPercent = Math.floor((count/listURL.length)*100);

    let destination = (Array.isArray(destDir)) ? destDir[file] : destDir;

    if (option.filename) {
      _option.filename = (Array.isArray(option.filename)) ? _option.filename[file] : null;
    } 
      
    list.push(await download(listURL[file], destination, _option, function(itemPercent, speed, destFile){  
        let percent = progressPercent + Math.floor((slice_size/100)*itemPercent);
        callbackProgress(percent, speed, destFile);
    })); 
    count = count + 1;
  }
  
  return list;
}

if (torrent && typeof torrent === "function") module.exports.torrent = torrent;