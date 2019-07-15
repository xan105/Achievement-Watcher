"use strict";

const http = require('http');
const https = require('https');
const urlParser = require('url');

const DEFAULT = {
  timeout : 3000,
  userAgent : 'Chrome/'
};

const request = module.exports = (url, option = {} ) => {

  let options = {
    timeout : option.timeout || DEFAULT.timeout,
    headers : {
      'Content-Type': 'text/html',
      'User-Agent': DEFAULT.userAgent
    }
  };
  
  if (option.headers) {
    Object.assign(options.headers,option.headers);
  }

  return new Promise((resolve, reject) => {

    url = urlParser.parse(url);
    url.headers = options.headers;

    const lib = (url.protocol === "https:") ? https : http;
    let req = lib.get(url, (response) => {
    
      if (response.statusCode >= 200 && response.statusCode < 300) { 

        let data = [];
        response.on('data', (chunk) => {
             data.push(chunk);
        });
        response.on('end', () => {
             
             try {
                let result = data.join('');
                resolve(result);
             } catch(err) {
                reject(err);
             }
             
        });
        response.on('error', function(err) {
             reject(err);
             req.abort();
        });
        
      } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      
        let redirect = (urlParser.parse(response.headers.location).hostname) ? response.headers.location : `${url.protocol}//${url.hostname}/${response.headers.location}`;
        return resolve(request(redirect, option));

      } else {
         reject(response.statusCode);
         req.abort();
      }
      
      
   });
   req.setTimeout(options.timeout, () => {
        req.abort();
   });
   req.on('error', (err) =>  {
        reject(err);
        req.abort();
   });
  
  });  
}

module.exports.getJson = async (url, option = {} ) => {

  let options = {
    timeout : option.timeout || DEFAULT.timeout,
    headers : {
      'Content-Type': 'application/json',
      'User-Agent': DEFAULT.userAgent
    }
  };
  
  if (option.headers) {
    Object.assign(options.headers,option.headers);
  }

  try {
  
     let json = await request(url, options);
     return JSON.parse(json);

  }catch(err){
     throw err;
  }

}