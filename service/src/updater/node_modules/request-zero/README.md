Request-zero is based around the Node.js's HTTP(S) API interfaces.<br />
It retries on error, follows redirects and provides progress when downloading (pipe to stream) out of the box.<br />
It uses promises and has no dependencies.

_There is also a version that uses the Web Fetch API for the Browser ([See below for more details](#Browser))._

Common use cases:
=================

```js
const request = require('request-zero');

(async () => {
    
     //Simplest call
     let res = await request("https://steamdb.info/app/220/");
     console.log(res.body); //=> '<!DOCTYPE HTML> ...'
     
     //Get json data
     let json = await request.getJson("https://jsonplaceholder.typicode.com/todos/1");
     console.log(json); //=> '{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }'
     
     //Get json data from github
     let json = await request.getJson("https://api.github.com/repos/user/repo/releases/latest",
                                     {headers: {"Accept" : "application/vnd.github.v3+json"}});
     console.log(json); //=> { url: '...', tag_name: '0.0.0', target_commitish: 'master', ... }
     
     //Head request
     let res = await request.head(`http://ipv4.download.thinkbroadband.com/1GB.zip`);
     console.log(res); //=> { status: 200, message: 'OK', headers: {...} }
      
     //Simple download to disk (pipe to stream)
     await request.download("http://ipv4.download.thinkbroadband.com/1GB.zip", 
                            "D:/Downloads", printProgress)
     
     //Download from github ... aws redirection ... content disposition ... but custom filename
     let res = await request.download("https://github.com/user/repo/releases/download/0.0.0/Setup.exe", 
                                      "D:/Downloads/", {filename: "supersetup.exe"}, printProgress); 
     console.log(res); //=> { status: 200, message: 'OK', headers: {...}, 
                              path: 'D:\\Downloads\\supersetup.exe' }
     
     //Download a list of files one by one
     await request.download.all(["http://ipv4.download.thinkbroadband.com/5MB.zip",
                                 "http://ipv4.download.thinkbroadband.com/10MB.zip",
                                 "http://ipv4.download.thinkbroadband.com/20MB.zip",
                                 "http://ipv4.download.thinkbroadband.com/50MB.zip"],
                                 "D:\\Downloads", printProgress);
    
    //Upload a single file multipart/form-data
    let res = await request.upload("http://127.0.0.1/upload/test/", 
                                   "Hello world", {name: "file", filename: "hello world.txt"});
    console.log(res); //=> { status: 200, message: 'OK', headers: {...}, body: 'ok' }
    
    //Use of custom retry on error and redirection to follow
    await request("https://steamdb.info/app/220/", {maxRetry: 2, maxRedirect: 2});
     
})();

//Callback example for request.download
function printProgress(percent, speed, file){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${percent}% @ ${speed} kb/s [${file}]`);
}

```
There are more options and methods short-hand, see below.

Common API Options
==================

All methods accept an optional object which you can set with any of the following :

|option|default|description|
-------|-------|------------
|timeout|3000 ms | Time before aborting request|
|maxRedirect| 3 | How many redirections to follow before aborting.<br/>Use 0 to not follow redirects |
|maxRetry| 0 (request)<br/>3 (download) | How many retries on error before aborting.<br/>Use 0 to not retry at all |
|retryDelay| 200 ms (request)<br/>500 ms (download) | How long to wait before a retry.<br/>Use 0 to instantly retry |
|headers| {'User-Agent': 'Chrome/'} | Headers of your request

There are more options but they are specific to certains methods, check the API section.

API
===

All *request.**x*** methods are short-hand of a wrapper to the Node.js's HTTP(S) API interfaces *http(s).request()*<br/>
All *request.download.**x*** methods are short-hand of a wrapper to the Node.js's HTTP(S) API interfaces *http(s).get()* which pipes the data to a *WriteStream*.<br/>

There are multiple points of failure, the API tries to return an error object with the same properties as much as possible.
```js
{
 code : ..., // HTTP Response code | Node.js error code
 message: ..., // HTTP Response message | Node.js error message,
 url: ..., // URL
 headers: ... // HTTP Response headers when available and relevant
}
```

+ `request.getJson(url **string**, [option] object)`<br/>
    Make a GET request to url with 'Accept' header set to 'application/json, application/json;indent=2' if unset in option and parse the result.<br/>
    Returns the JSON.parsed data.
+ `request.head(url string, [option] object)`<br/>
    Make a HEAD request to url. Returns response headers no matter the HTTP response code.<br/> 
    NB: Doesn't follow redirection by design. So maxRedirect is useless here.<br/> 
    If you need to follow the redirection you can use the headers['location'] from the response and make a new HEAD request.<br/>
    Returns an object:
    ```js
    {
      code: ..., // HTTP Response code
      message: ..., //HTTP Response message
      url: ..., // URL
      headers: ... //HTTP Response headers
    }
     ```
+ `request.get(url string, [option] object)` <br/>
    Make a GET request to url.<br/>
    NB: Since request default to method 'GET' you could just use request directly. But this is here for completeness.<br/>
    Returns an object:
    ```js
    {
      code: ..., // HTTP Response code
      message: ..., //HTTP Response message
      url: ..., // URL
      headers: ..., //HTTP Response headers
      body: ... // HTTP Response body on success
    }
    ```
+ `request.post(url string, [payload] string|Buffer, [option] object)`<br/>
    Make a POST request to url and write/push payload.<br/>
    NB: On HTTP 301, 302, 303 redirection the method will be [changed to GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections)<br/>
    Returns as above.
+ `request.upload(url string, content string|Buffer, [option] object)`<br/>
    Make a POST request with content within a multipart/form-data payload.<br/>
    You can use option {fieldname: ..., filename: ...} to specify the form field name and the file name.<br/>
    If you don't they will default respectively to 'file' and Date.now().<br/>
    Returns as above.
+ `request.download(url string, destDir string, [option] object, [callbackProgress] function)`<br/>
    Download file from url to destDir (if the dir doesn't exist it will be created for you).<br/>
    You can force the filename with option {filename: ...}.<br/>
    Progress gives you the following stats: percent, speed, file.<br/>
    Returns as above with an additional 'path' property set to the location the file was written in.<br/>
    This is useful for promise chaining to example unzip an archive, etc.
+ `request.download.all(listURL array, destDir string|array, [option] object, [callbackProgress] function)`<br/>
    Download files in the list array one-by-one to destDir (if the dir doesn't exist it will be created for you).<br/>
    If destDir is an array, files[i] will be written to destDir[i] in a 1:1 relation.<br/>
    You can the same way force the filename of the files with option {filename: [..,..,..]}.<br/>
    Progress gives you the following stats: percent, speed, file.<br/>
    Returns a list of result as above with an additional 'path' property set to the location the file was written in.
+ `request(url string, [payload] string|Buffer, [option] object)`<br/>
    Make a request by default 'GET' use option {method: GET POST HEAD etc} to change it.<br/>
    Use payload when using method 'POST'.<br/>
    Returns an object:
    ```js
    {
      code: ..., // HTTP Response code
      message: ..., //HTTP Response message
      url: ..., // URL
      headers: ..., //HTTP Response headers
      body: ... // HTTP Response body on success
   }
   ```

Browser
=======
There is a version using the Web (Browser) Fetch API in `fetch.js`.<br/>
This is meant to be used in a Browser env.<br/>
_Not all features are available._

+ `request(url string, [option] object)`<br/>
    Make a request by default 'GET' use option {method: GET HEAD etc} to change it.<br/>

Has 2 more options than the Node version :

|option|default|description|
-------|-------|------------
|mode|'cors'| The mode you want to use for the request.<br/>eg: cors, no-cors, or same-origin |
|cache| 'no-store' | The cache mode you want to use for the request.<br/>eg: default, no-store, reload, no-cache, force-cache, only-if-cached. |

```js
//Example 

import request from 'request-zero';

request("some/url").then((res) => {
    console.log(res.body);
}).catch((err) => {
    console.error(err);
});

```
