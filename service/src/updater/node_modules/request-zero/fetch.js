/*
MIT License
Copyright (c) 2019 Anthony Beaumont
https://github.com/xan105/node-request-zero
*/

/*
Like request.js but with the fetch API.
This is meant to be used in a Browser env.
*/

"use strict";

export default function request(href,option = {}){

  let options = {
    method: option.method || "GET",
    timeout : option.timeout || 3000,
    maxRedirect: (option.maxRedirect || option.maxRedirect == 0) ? option.maxRedirect : 3,
    maxRetry: (option.maxRetry || option.maxRetry == 0) ? option.maxRetry : 0,
    retryDelay: option.retryDelay || 200,
    headers : new Headers(option.headers),
    mode: option.mode || 'cors',
    cache: option.cache || 'no-store', // default,no-store,reload,no-cache,force-cache,only-if-cached
  };

  return new Promise((resolve, reject) => {
  
    let url;
    try{
      url = new URL(href);
    }catch(err){
      return reject( {code:"BAD URL", message: err, url: href} );
    }
    
    if (typeof window !== "undefined" && typeof window.document !== "undefined" && window.fetch) { //Browser ? and has fetch API ?
    
        const controller = new AbortController();
        const signal = controller.signal;
        options.signal = signal;
        options.redirect = "manual";
        
        const timeout = setTimeout(function() {
              option.maxRetry = options.maxRetry - 1;
              if (option.maxRetry < 0) {
                 reject({
                  code: "ETIMEOUT", 
                  message: "connect ETIMEDOUT",
                  url: url.href
                 });
                 controller.abort();     
              } else {
                 setTimeout(function(){
                    return resolve(request(href, option));
                 }, options.retryDelay); 
              }
        }, options.timeout);
        
        fetch(url,options)
        .then(function(res) {
        
            clearTimeout(timeout);
            
            if(options.method === "HEAD") {
            
              resolve({
                code: res.status,
                message: res.statusText,
                url: url.href,
                headers: parseHeaders(res.headers)
              });
              
            } else if (res.status >= 200 && res.status < 300) {
            
                if(res.ok) {
                      
                    res.text().then((data)=>{
                        resolve({
                            code: res.status,
                            message: res.statusText,
                            url: url.href,
                            headers: parseHeaders(res.headers),
                            body: data
                        });
                     });
                     
                } else {
                    option.maxRetry = options.maxRetry - 1;
                    if (option.maxRetry < 0) {
                       reject({
                         code: 'EINTERRUPTED', 
                         message: 'The connection was terminated while the message was still being sent', 
                         url: url.href,
                         headers: parseHeaders(res.headers)
                       });
                    } else {
                       setTimeout(function(){
                          return resolve(request(href, option));
                       }, options.retryDelay);
                    } 
                }      
                  
            } else if (res.status >= 300 && res.status < 400 && res.redirected) {

                option.maxRedirect = options.maxRedirect - 1;
                if (options.maxRedirect < 0) {
                  return reject({
                            code:"EREDIRECTMAX", 
                            message:"Maximum redirection reached",
                            url: url.href,
                            headers: parseHeaders(res.headers)
                          });
                } else {

                    if (options.method === 'POST' && [301, 302, 303].includes(res.status)) {
                        option.method = 'GET';
                        if (option.headers) {
                          delete option.headers['content-length']; 
                          delete option.headers['content-type'];
                        }
                    }

                    return resolve(request(res.url, option)); 
                  }

            } else {
          
               option.maxRetry = options.maxRetry - 1;
               if (option.maxRetry < 0) {
                   reject({
                    code: res.status, 
                    message: res.statusText,
                    url: url.href,
                    headers: parseHeaders(res.headers)
                   });
                   controller.abort();    
               } else {
                   setTimeout(function(){
                      return resolve(request(href, option));
                   }, options.retryDelay);
               }

            }
   
       }).catch((err)=>{
       
              clearTimeout(timeout);
              
              option.maxRetry = options.maxRetry - 1;
              if (option.maxRetry < 0) {
                 reject({
                  code: err.code, 
                  message: err.message,
                  url: url.href
                 });
                 controller.abort();     
              } else {
                 setTimeout(function(){
                    return resolve(request(href, option));
                 }, options.retryDelay);
              }   
       });
   
    } else {
       return reject( {code:"Error", message: "Web (Browser) Fetch API is not available"} );
    }
    
  });
}

function parseHeaders(headers){
  let response = {};
  
  headers.forEach((value, name) => { response[name] = value });
  
  return response;
}