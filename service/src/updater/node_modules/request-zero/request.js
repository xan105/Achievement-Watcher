/*
MIT License
Copyright (c) 2019 Anthony Beaumont
https://github.com/xan105/node-request-zero
*/

"use strict";

const http = require('http');
const https = require('https');
const urlParser = require('url');
const download = require('./download.js');

const request = module.exports = (href, payload, option = {}) => {
  
  if (payload && typeof(payload) === 'object' && typeof(payload) !== 'string' && !Buffer.isBuffer(payload)) {
		option = payload
		payload = null;
	}
  
  let options = {
    method: option.method || "GET",
    timeout : option.timeout || 3000,
    maxRedirect: (option.maxRedirect || option.maxRedirect == 0) ? option.maxRedirect : 3,
    maxRetry: (option.maxRetry || option.maxRetry == 0) ? option.maxRetry : 0,
    retryDelay: option.retryDelay || 200,
    headers : {
      'User-Agent': 'Chrome/'
    }
  };
  
  if (option.headers) {
    Object.assign(options.headers,option.headers);
  }

  return new Promise((resolve, reject) => {
  
    if (!href) return reject( {code:"BAD URL", message:`URL is ${typeof(url)}`} );
  
    let url = urlParser.parse(href);
    if(!url.hostname || !url.protocol) return reject( {code:"BAD URL", message:`URL is malformed, url: href`} );
    url.headers = options.headers;
    url.method = options.method.toUpperCase();
  
    const lib = (url.protocol === "https:") ? https : http;
    let req = lib.request(url, (res) => {

      if(url.method === "HEAD") {
        resolve({
          code: res.statusCode,
          message: res.statusMessage,
          url: url.href,
          headers: res.headers
        });
      }
      else if (res.statusCode >= 200 && res.statusCode < 300) {
      
          let data = [];
          res.on('data', (chunk) => { 
              data.push(chunk);
          }).on('end', () => { 
              if (res.complete) {
                resolve({
                    code: res.statusCode,
                    message: res.statusMessage,
                    url: url.href,
                    headers: res.headers,
                    body: data.join('')
                });
              }else{
                  option.maxRetry = options.maxRetry - 1;
                  if (option.maxRetry < 0) {
                    reject({
                      code: 'EINTERRUPTED', 
                      message: 'The connection was terminated while the message was still being sent', 
                      url: url.href,
                      headers: res.headers
                    });
                  } else {
                    setTimeout(function(){
                      return resolve(request(href, payload, option));
                    }, options.retryDelay);
                  } 
              }
          }).on('error', (err) => {
              option.maxRetry = options.maxRetry - 1;
              if (option.maxRetry < 0) {
                reject({
                  code: err.code, 
                  message: err.message,
                  url: url.href,
                  headers: res.headers
                });
                req.abort();    
              } else {
                  setTimeout(function(){
                      return resolve(request(href, payload, option));
                  }, options.retryDelay);
              }    
          });

      }
      else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        
        option.maxRedirect = options.maxRedirect - 1;
        if (options.maxRedirect < 0) {
          return reject({
                    code:"EREDIRECTMAX", 
                    message:"Maximum redirection reached", 
                    url: url.href,
                    headers: res.headers
                  });
        } else {
          let redirect = (urlParser.parse(res.headers.location).hostname) ? res.headers.location : `${url.protocol}//${url.hostname}/${res.headers.location}`;
          
          if (url.method === 'POST' && [301, 302, 303].includes(res.statusCode)) {
              option.method = 'GET';
              if (option.headers) {
                delete option.headers['content-length']; 
                delete option.headers['content-type'];
              }
              if (payload) payload = null;
              
          }

          return resolve(request(redirect, payload, option));
        }
        
      }
      else {
      
         option.maxRetry = options.maxRetry - 1;
         if (option.maxRetry < 0) {
             reject({
              code: res.statusCode, 
              message: res.statusMessage,
              url: url.href,
              headers: res.headers
             });
             req.abort();    
         } else {
            setTimeout(function(){
               return resolve(request(href, payload, option));
            }, options.retryDelay);
         } 

      }
      
    }).setTimeout(options.timeout, () => {
            req.abort();
    }).on('error', (err) =>  {
            option.maxRetry = options.maxRetry - 1;
            if (option.maxRetry < 0) {
               reject({
                code: err.code, 
                message: err.message,
                url: url.href,
               });
               req.abort();    
            } else {
               setTimeout(function(){
                  return resolve(request(href, payload, option));
               }, options.retryDelay);
            }   
    });

    if (url.method === "POST") {  
        if (!payload) {
          reject( {code: "ERR_INVALID_ARG_TYPE", message: `payload is ${typeof(options.payload)}`} );
          req.abort();
        } else {
          req.write(payload); 
        }
    }

    req.end();
  });
  
}

module.exports.post = (url, payload, option = {} ) => {
  option.method = "POST";
  return request(url, payload, option);
}

module.exports.get = (url, option = {} ) => {
  option.method = "GET";
  return request(url, option);
}

module.exports.head = (url, option = {} ) => {
  option.method = "HEAD";
  return request(url, option);
}

module.exports.getJson = async (url, option = {} ) => {

  if (!option.headers) option.headers = {};
  if (!option.headers['Accept']) option.headers['Accept'] = 'application/json, application/json;indent=2';
  option.method = "GET";

  try {
     let json = (await request(url, option)).body;
     return JSON.parse(json);
  }catch(err){
     throw err;
  }

}

module.exports.upload = async (url, content, option = {} ) => {
  
  try {

    if(!content) throw {code: "ERR_INVALID_ARG_TYPE", message: `content is ${typeof(content)}`};

    const crlf = "\r\n";
    let headers = `Content-Disposition: form-data; name="${option.fieldname || 'file'}"; filename="${option.filename || Date.now()}"` + crlf;
    let boundary = `--${Math.random().toString(16)}`;
    let delimeter = {
       start: `${crlf}--${boundary}`,
       end: `${crlf}--${boundary}--`
    }
        
    let payload = Buffer.concat([
        Buffer.from(delimeter.start + crlf + headers + crlf),
        Buffer.from(content),
        Buffer.from(delimeter.end)]
    );
    
    if (!option.headers) option.headers = {};
    option.headers['Content-Type'] = "multipart/form-data; boundary=" + boundary;
    option.headers['Content-Length'] = payload.length;
    option.method = "POST";

    let result = await request(url, payload, option);
    return result;
  
  }catch(err){
    throw err;
  }
}

module.exports.download = download;