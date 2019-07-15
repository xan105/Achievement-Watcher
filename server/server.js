"use strict";
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error : "Too many requests, please try again later.",
    data : null
  }
});
const steam = require("./steam.js");
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/server.log")
});

const config = require("./config.json");

const app = express();

app.disable('x-powered-by');
if (config.proxy === true) { app.enable("trust proxy") } // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(helmet());
app.use(rateLimit);
app.use(bodyParser.urlencoded({extended: true}));

app.get("/steam/ach/:appid", (req, res) => { //reroute old route to new

  debug.log(`Rerouting to new route ...`);

  let appID = req.params.appid;
  let lang = req.query.lang;

  (lang) ? res.redirect(301,`/steam/ach/schema/${appID}?${lang}`) : res.redirect(301,`/steam/ach/schema/${appID}`);
  
}).get("/steam/ach/schema/:appid", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  try {

    let appID = numerify(req.params.appid);
    let lang = stringify(req.query.lang);
    
    debug.log(`Request ach schema received for ${appID}`);
    if (lang) debug.log(`with lang: ${lang}`);

    result.status = 200;
    result.response.data = await steam.getSchema(appID,lang);
  
  } catch(err) {
    if (err === "Unsupported API language code") {
      result.status = 400;
      result.response.error = err;
    } else {
      result.status = 500;
      result.response.error = "Internal Server Error";
      debug.log("An error has occurred in API: 'Steam/achievement/GetSchema':\n" + err);
    }
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).get("/steam/ach/stats/:user/:appid", async (req, res) => {
  
  let result = { 
    status : null,
    response : { error : null,
                 data : null
               }
  };

  try {

    let user = stringify(req.params.user); //int64
    let appID = numerify(req.params.appid);
    
    debug.log(`Request user stats (${user}) received for ${appID}`);

    result.status = 200;
    result.response.data = await steam.getUserStats(user,appID);
  
  } catch(err) {
      result.status = 500;
      result.response.error = "Internal Server Error";
      debug.log("An error has occurred in API: 'Steam/achievement/GetUserStats':\n" + err);
  }
  finally {
    debug.log("Sending response");
    res.status(result.status).json(result.response);
  }

}).use(function(req, res) {
    res.status(404).end('error');
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