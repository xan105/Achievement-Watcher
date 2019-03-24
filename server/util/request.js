"use strict";

const http = require('http');
const https = require('https');
const urlParser = require('url');

const DEFAULT = {
  timeout : 3000,
  userAgent : 'Chrome/'
};

const request = module.exports = (request_url, option = {} ) => {

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

    let url = urlParser.parse(request_url);
    url.headers = options.headers;

    const lib = (url.protocol === "https:") ? https : http;
    let request = lib.get(url, (response) => {
    
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
             request.abort();
        });
      
      } else {
         reject(response.statusCode);
         request.abort();
      }
      
      
   });
   request.setTimeout(options.timeout, () => {
        request.abort();
   });
   request.on('error', (err) =>  {
        reject(err);
        request.abort();
   });
  
  });  
}

module.exports.getJson = async (request_url, option = {} ) => {

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
  
     let json = await request(request_url, options);
     return JSON.parse(json);

  }catch(err){
     throw err;
  }

}