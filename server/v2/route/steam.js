import express from "express";
import sanitize from "express-validator";
import * as response from "../util/reqResponse.js";
import * as steamAPI from "../api/steam/steam.js"; 

const router = express.Router();

router.get("/gameindex", async (req, res) => { 
 try {
 
	const data = await steamAPI.getServerGameIndex();
	response.success(res,data);
	
 }catch(err){
  
  if ( err.code === "ENOENT") 
  {
    response.failure(res,{code: 404});
  }
  else if ( err.code && err.code >= 100 && err.code <= 599 ) {
    response.failure(res,{code: err.code, msg: err.msg});
  } else {
    response.failure(res);
  }
 }
})
.get("/appinfo/:appid", async (req, res) => { 
 
 try {
   //Sanitize
   await sanitize.param("appid").escape().toInt().run(req);
   //Check
   if (!(Number.isInteger(req.params.appid) && req.params.appid > 0)) return response.failure(res,{code: 400});
   
   const data = await steamAPI.productInfoRequest(req.params.appid);
   
   response.success(res,data);
   
 }catch(err){
  
  if ( err === "ENOGAME") 
  {
    response.failure(res,{code: 400, msg: "appID must be of type GAME no DLC or others type are accepted"});
  }
  else if ( err === "EINVALIDAPPID")
  {
    response.failure(res,{code: 400});
  } 
  else if ( err === "EAPPIDNOTFOUND")
  {
    response.failure(res,{code: 404});
  }
  else if ( err.code && err.code >= 100 && err.code <= 599 ) {
    response.failure(res,{code: err.code, msg: err.msg});
  } else {
    response.failure(res);
  }
 }
}).get("/achievement/schema/:appid", async (req, res) => {
 
 try {
   //Sanitize
   await sanitize.param("appid").escape().toInt().run(req);
   if (req.query.lang) await sanitize.query("lang").escape().trim().run(req);
   //Check
   if (!(Number.isInteger(req.params.appid) && req.params.appid > 0)) return response.failure(res,{code: 400});

   const data = await steamAPI.getSchema(req.params.appid,req.query.lang);
   
   response.success(res,data);
   
 }catch(err){
 
  console.error(err);
  
  if ( err === "EINVALIDAPPID")
  {
    response.failure(res,{code: 400});
  } 
  else if ( err === "EUNSUPPORTEDLANG")
  {
	response.failure(res,{code: 400, msg: "This language is not supported by the Steam API"});
  }
  else if ( err === "ENOACHIEVEMENT")
  {
	response.failure(res,{code: 404});
  }
  else if ( err.code && err.code >= 100 && err.code <= 599 ) {
    response.failure(res,{code: err.code, msg: err.msg});
  } else {
    response.failure(res);
  }
 }
 
}).get("/achievement/:steamid/:appid", async (req, res) => {

 try{
   //Sanitize
   await sanitize.param("steamid").escape().trim().run(req);
   await sanitize.param("appid").escape().toInt().run(req);
   //Check
   if (!(Number.isInteger(req.params.appid) && req.params.appid > 0)) return response.failure(res,{code: 400});

   const data = await steamAPI.getUserAchievement(req.params.appid,req.params.steamid);
   
   response.success(res,data);
 
 }catch(err){
 
  if ( err === "EINVALIDAPPID")
  {
    response.failure(res,{code: 400});
  } 
  else if ( err === "EINVALIDSTEAMDID")
  {
	response.failure(res,{code: 400, msg: "Not a valid SteamID. Please use a SteamID64 or a Steam2 rendered ID or a Steam3 rendered ID or a Steam Account ID"});
  }
  else if ( err === "ENOSTATS")
  {
	response.failure(res,{code: 404});
  }
  else if ( err.code === 403 ){
    response.failure(res,{code: 403, msg: "Forbidden - Is the requested SteamID profile set to Public ?"});
  }
  else if ( err.code && err.code >= 100 && err.code <= 599 ) {
    response.failure(res,{code: err.code, msg: err.msg});
  } else {
    response.failure(res);
  }
 }
});                                        

export default {
  endpoint : "/v2/steam",
  router : router
};