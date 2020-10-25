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

const http = require('http');
const https = require('https');
const urlParser = require('url');
const util = require('util');// xml2js promisify
const download = require('./download.cjs');

let xml2js;
try 
{
  xml2js = require('xml2js');
  if (!xml2js) xml2js = null;
} catch{ xml2js = null }

const request = module.exports = (href, payload, option = {}) => {
  
  if (payload && typeof(payload) === 'object' && typeof(payload) !== 'string' && !Buffer.isBuffer(payload)) {
		option = payload
		payload = null;
	}
  
  let options = {
    method: option.method || "GET",
    encoding: option.encoding || "utf8",
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
  
    if (typeof href !== "string" && !Array.isArray(href)) return reject( {code:"ERR_INVALID_ARG_TYPE", message:`URL is not a string. Received ${typeof(href)}`} );
    if(Array.isArray(href) && !href.every(url => typeof url === "string")) return reject( {code:"UNEXPECTED_URL_ARRAY", message:"URL as an array is only used internally and should be made only of strings !"} );
  
    if (!Array.isArray(href) && typeof href === "string") href = [href];
    let url = urlParser.parse(href[href.length-1]);
    
    if(!url.hostname || !url.protocol) return reject( {code:"BAD_URL", message:`URL is malformed. Received: "${href}"`} );
    url.headers = options.headers;
    url.method = options.method.toUpperCase();
  
    const lib = (url.protocol === "https:") ? https : http;
    let req = lib.request(url, (res) => {
	  
	  res.setEncoding(options.encoding);
	  
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
                    trace: href,
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
                      trace: href,
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
                  trace: href,
                  headers: res.headers
                });
                req.destroy();    
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
                    trace: href,
                    headers: res.headers
                  });
        } else {

          let redirect = (urlParser.parse(res.headers.location).hostname) ? res.headers.location : new urlParser.URL(res.headers.location,`${url.protocol}//${url.hostname}`).href;
          href.push(redirect);
          
          if (url.method === 'POST' && [301, 302, 303].includes(res.statusCode)) {
              option.method = 'GET';
              if (option.headers) {
                delete option.headers['content-length']; 
                delete option.headers['content-type'];
              }
              if (payload) payload = null;   
          }
          
          return resolve(request(href, payload, option));
          
        }
        
      }
      else {
      
         option.maxRetry = options.maxRetry - 1;
         if (option.maxRetry < 0) {
             reject({
              code: res.statusCode, 
              message: res.statusMessage,
              url: url.href,
              trace: href,
              headers: res.headers
             });
             req.destroy();    
         } else {
            setTimeout(function(){
               return resolve(request(href, payload, option));
            }, options.retryDelay);
         } 

      }
      
    }).setTimeout(options.timeout, () => {
            req.destroy();
    }).on('error', (err) =>  {
            option.maxRetry = options.maxRetry - 1;
            if (option.maxRetry < 0) {
               reject({
                code: err.code, 
                message: err.message,
                url: url.href,
                trace: href,
               });
               req.destroy();    
            } else {
               setTimeout(function(){
                  return resolve(request(href, payload, option));
               }, options.retryDelay);
            }   
    });

    if (url.method === "POST") {  
        if (!payload) {
          reject( {code: "ERR_INVALID_ARG_TYPE", message: `payload is ${typeof(options.payload)}`} );
          req.destroy();
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

  const { body : data } = await request(url, option);
  const json = JSON.parse(data);
  return json;

}

async function getXml (url, option = {} ) {

  if (!option.headers) option.headers = {};
  if (!option.headers['Accept']) option.headers['Accept'] = 'application/xml';
  option.method = "GET";

  const { body : data } = await request(url, option);
  const xml = await util.promisify(xml2js.parseString)(data,{explicitArray: false, explicitRoot: false, ignoreAttrs: true, emptyTag: null});
  return xml;

}

module.exports.upload = async (url, content, option = {} ) => {

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
}

if (xml2js) module.exports.getXml = getXml;

module.exports.download = download;