"use strict";
const path = require('path');
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error : "Too many requests, please try again later.",
    data : null
  }
});
const steam = require("./steam.js");
const uplay = require("./uplay.js");
const blacklist = require("./blacklist.js");
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/server.log")
});

const config = require("./config.json");
const upload = multer({ 
  dest: 'temp/',
  fileFilter: function(req, file, cb){
    try {
    
      debug.log(`Received file '${file.originalname}' !`);
      
      if ( req.headers['x-hello'] !== "Y*Xsv+k77_Vz*tLW" ) {
        debug.log("File filtered out: unvalid [x-hello] header !");
        cb(null, false);
      } else if ( (path.parse(file.originalname)).ext !== ".zip" ) {
        debug.log("File filtered out: not a .zip !");
        cb(null, false);
      } else {
        cb(null, true);
      }
    }catch(err){
      cb(new Error(err));
    }
  }
});

const app = express();

app.disable('x-powered-by');
if (config.proxy === true) { app.enable("trust proxy") } // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(helmet());
app.use(rateLimit);
app.use(bodyParser.urlencoded({extended: true}));

if(config.static === true){
  app.use('/uplay/img', express.static(__dirname + '/cache/uplay/img', {index: false, etag: false, maxAge: '1m'}));
}

app.get("/steam/ach/:appid", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  let appID = numerify(req.params.appid);
  
  try {

    let lang = stringify(req.query.lang);

    debug.log(`Request received: ach schema for ${appID}`);
    if (lang) debug.log(`with lang: ${lang}`);

    if (appID == 0) {
      result.status = 400;
      result.response.error = "Bad Request";
    }
    else if (await blacklist.isIn(appID)) {
      debug.log(`${appID} is blacklisted`);
      result.status = 409 ;
      result.response.error = "this appID is currently blacklisted";
    } else {
      result.status = 200;
      result.response.data = await steam.getSchema(appID,lang);
    }

  } catch(err) {
    
    if (err === "Unsupported API language code") {
      result.status = 400;
      result.response.error = err;
    } else if (err.toString().includes("ETIMEDOUT") || err.toString().includes("ECONNABORTED")) {
      result.status = 504;
      result.response.error = "Gateway Time-out";
      debug.log("An error has occurred in API: 'Steam/achievement/GetSchema':\n" + err);
    } else if (err.code == 503) {
      result.status = 503;
      result.response.error = "Service Temporarily Unavailable";
      debug.log("An error has occurred in API: 'Steam/achievement/GetSchema':\n" + err);
    }else {
      result.status = 500;
      result.response.error = "Internal Server Error";
      debug.log("An error has occurred in API: 'Steam/achievement/GetSchema':\n" + err);
      try{
        blacklist.add(appID).then(()=>{
          debug.log(`${appID} added to blacklist`);
        });
      }catch(e){}
    }
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).get("/steam/user/:user/stats/:appid", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  try {

    let user = stringify(req.params.user); //int64
    let appID = numerify(req.params.appid);
    
    debug.log(`Request received: user stats (${user}) for ${appID}`);

    result.status = 200;
    result.response.data = await steam.getUserStats(user,appID);
  
  } catch(err) {
    if (err === 400) {
        result.status = 400;
        result.response.error = "Steam: Bad Request";
     } else if (err === 403) {
        result.status = 403;
        result.response.error = "Steam: Forbidden - Is the requested profile set to Public ?";
     } else {
        result.status = 500;
        result.response.error = "Internal Server Error";
        debug.log("An error has occurred in API: 'Steam/achievement/GetUserStats':\n" + err);
     }
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).get("/steam/getBogusList", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  try {

    debug.log("Request received: bogus appId list");
    
    result.status = 200;
    result.response.data = await blacklist.get();
  
  } catch(err) {
      result.status = 500;
      result.response.error = "Internal Server Error";
      debug.log("An error has occurred in API: 'Steam/getBogusList':\n" + err);
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).get("/uplay/ach/:appid", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  let appID = numerify(req.params.appid);
  
  try {

    let lang = stringify(req.query.lang);

    debug.log(`Request received: uplay ach schema for ${appID}`);
    if (lang) debug.log(`with lang: ${lang}`);

    if (appID == 0) {
      result.status = 400;
      result.response.error = "Bad Request";
    } else {
      result.status = 200;
      result.response.data = await uplay.getSchema(appID,lang);
    }

  } catch(err) {
    
    if (err === "Unsupported API language code") {
      result.status = 400;
      result.response.error = err;
    } else {
      result.status = 500;
      result.response.error = "Internal Server Error";
      debug.log("An error has occurred in API: 'Uplay/achievement/GetSchema':\n" + err);
    }
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).post('/uplay/share', upload.single('eXVeFUuMuaDnFXww'), async (req, res, next) => {

  try{
  
    if (!req.file) return;
    res.status(200).end('OK');
    await uplay.saveSharedCache(req.file.path);
  }catch(err){
    debug.log(err);
  }
  
}).use(function(req, res) {
    res.status(404).end('error 404');
});

app.listen(config.port, config.host, () => { 
  debug.log("Server Started.")
}).on('error', (err) => { 
  debug.log(err); 
});

function stringify(str) {
    if(str){
      return str.toString().replace(/<\/?[^>]+>/gi, '');
    }
}

function numerify(str) {
  if (str) {
    return Number(str.toString().replace(/[^\d]/g, ''));
  }
}