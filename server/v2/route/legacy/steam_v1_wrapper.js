import express from "express";
import sanitize from "express-validator";
import { getSchema } from "../../api/steam/steam.js"; 
import * as response from "../../util/reqResponse.js";

const router = express.Router();

router.get("/ach/:appid", async (req, res) => { 
try {
   //Sanitize
   await sanitize.param("appid").escape().toInt().run(req);
   if (req.query.lang) await sanitize.query("lang").escape().trim().run(req);
   //Check
   if (!(Number.isInteger(req.params.appid) && req.params.appid > 0)) return response.failure(res,{code: 400});

   let data = await getSchema(req.params.appid,req.query.lang);
   
   try{
	   data.img = {
			header: `https://cdn.akamai.steamstatic.com/steam/apps/${data.appid}/header.jpg`,
			background: `https://cdn.akamai.steamstatic.com/steam/apps/${data.appid}/page_bg_generated_v6b.jpg`,
			portrait: `https://cdn.akamai.steamstatic.com/steam/apps/${data.appid}/library_600x900.jpg`,
			hero: `https://cdn.akamai.steamstatic.com/steam/apps/${data.appid}/library_hero.jpg`,
			icon: `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${data.appid}/${data.icon}.jpg`
		}
		delete data.icon;
		data.apiVersion = 1;
		
		data.achievement.list.forEach((achievement) => {
			if (achievement.icon) achievement.icon = `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${data.appid}/${achievement.icon}.jpg`
			if (achievement.icongray) achievement.icongray = `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${data.appid}/${achievement.icongray}.jpg`
		});
		delete data.achievement.version;
	
	}catch(err){
	
	console.log(err);
	
		return response.failure(res,{code: 500, msg: "v1 compatibility failure"});
	}

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
})
.get("/user/:user/stats/:appid", (req, res) => { 
	res.redirect("https://api.xan105.com/v2/steam/achievement/"+ req.params.user +"/" + req.params.appid) //(Use full url: redirect bug AW all version; cf:request-zero <= 0.2.9)
})
.get("/getBogusList", (req, res) => { 
	response.failure(res,{code: 410, msg: "Gone"});
})

export default {
  endpoint : "/steam",
  router : router
};