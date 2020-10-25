import path from "path";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";
import logger from "@xan105/log";
import routes from "./router.js";

import { require } from "./util/esm.js";
const config = require("./config.json");

const debug = new logger({
  console: true,
  file: path.join(config.folder.log,"server.log")
});

const rateLimit = expressRateLimit({
  windowMs: config.rateLimit?.timeframe || 15 * 60 * 1000, // default 15 minutes
  max: config.rateLimit?.maxRequest || 200, // default limit each IP to 200 requests per windowMs
  message: {
    error : "Too many requests, please try again later",
    data : null
  }
});

// Init express and related modules
const app = express();
app.disable('x-powered-by');
if (config.proxy) app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(helmet());
app.use(rateLimit);
if (config.cors) app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

for (let route of routes) app.use(route.endpoint, route.router);

//Start the server
app.listen(config.port, config.host, () => { 
  debug.log(`Listening on [${config.host}]:${config.port}`);
}).on('error', (err) => debug.error(err));