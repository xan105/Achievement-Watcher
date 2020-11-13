import path from "path";
import request from "request-zero";
import SteamID from "steamid";
import * as fs from "@xan105/fs";
import { unescape } from "../../util/xml.js";

import productInfoRequest, { findBinary } from "./steamClient.js";
import getDataFromSteamDB from "./3rdparty/steamdb.info.js";
import getHiddenDescriptionFromCacheOrRemote from "./3rdparty/achievementstats.com.js";
import getDataFromSteamStoreFallbackStoreAPI from "./steamStore.js";

import { require } from "../../util/esm.js";
const languages = require("./api/steam/languages.json");
const { folder } = require("./config.json");
const apiKey = require("./key.json");

export async function getServerGameIndex(){
  
  console.log("getServerGameIndex");
  const filepath = path.join(folder.cache,"steam/schema/gameIndex.json");
  const index = JSON.parse(await fs.readFile(filepath)); 
  
  return index;
  
}

export async function getSteamGameInfoFromCacheOrRemote(appID){

  console.log("getSteamGameInfoFromCacheOrRemote");

  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  const filepath = path.join(folder.cache,"steam/schema/gameIndex.json");
  
  let db, gameInfo;
  try{
    
    console.log("> cache db exists");
    
    db = JSON.parse(await fs.readFile(filepath)); 
  }catch{
    db = [];
  }

  try
  {
    gameInfo = db.find(game => game.appid === appID);
    if (!gameInfo) throw "ENOTFOUND";
    console.log("> found in db");
  }catch{
    console.log("> not found in db");
    gameInfo = await generateSteamGameInfo(appID);
    
    if (gameInfo.appid && gameInfo.name && gameInfo.binary && gameInfo.icon){
      db.push(gameInfo);
      db.sort((a, b) => b.appid - a.appid); //recent first
      await fs.writeFile(filepath,JSON.stringify(db, null, 2)).catch(()=>{});
      console.log("> pushed to db");
    } else {
      console.warn("MISSING INFO");
      console.warn(gameInfo);
    }

  }
  
  return gameInfo;
  
} 

export async function getAchievementListFromCacheOrRemote(appID,lang = "english"){

  console.log("getAchievementListFromCacheOrRemote");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  if (!languages.some( language => language.api === lang )) throw "EUNSUPPORTEDLANG";
  
  const filepath = path.join(folder.cache,"steam/schema",lang,`${appID}.json`);
  
  let achievementList;
  
  if (await fs.existsAndIsYoungerThan(filepath,{timeUnit: 'M', time: 1}))
  {
    console.log("> from cache");
   
    achievementList = JSON.parse(await fs.readFile(filepath));
  } 
  else 
  {
    try
    {
      console.log("> nocache or out of date");
      achievementList = await generateAchievementList(appID,lang);
    }
    catch(err)
    {
      if (await fs.exists(filepath))
      {
        console.log("> fallback to previous data");
        achievementList = JSON.parse(await fs.readFile(filepath));
      } 
      else 
      {
        throw err;
      }
    }
  }
  
  return achievementList;
  
}

export async function getUserAchievement(appID, steamID){

  console.log("getUserAchievement");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  let userSteamID = new SteamID(steamID); //Steam2 rendered,Steam3 rendered,Steam64
  if (!userSteamID.isValid()) userSteamID = SteamID.fromIndividualAccountID(steamID); //Fallback to accountID
  if (!userSteamID.isValid()) throw "EINVALIDSTEAMDID";
  
  const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appID}&key=${apiKey.steam.web_api[1]}&steamid=${userSteamID.getSteamID64()}"`;
  
  const { playerstats : res } = await request.getJson(url);
  
  if (res.success) 
  {
	return res.achievements;
  }
  else 
  {
	if(res.error === "Requested app has no stats") throw "ENOSTATS" 
	else throw res.error
  }
 
}

async function findInAppList(appID){
  
  console.log("findInAppList");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  const filepath = path.join(folder.cache,"steam/appList.json");
  
  let list, app;
  
  try
  {
    list = JSON.parse(await fs.readFile(filepath));
    app = list.find(app => app.appid === appID);
    if (!app) throw "ENOTFOUND"; 
  } 
  catch
  {
    const url = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json";
    
    list = { applist : { apps } } = await request.getJson(url,{timeout: 4000});
    
    list.sort((a, b) => b.appid - a.appid); //recent first
    fs.promises.writeFile(filepath,JSON.stringify(list, null, 2));
    
    app = list.find(app => app.appid === appID);
    if (!app) throw "ENOTFOUND"; 
  }
  
  return app;

}

async function generateSteamGameInfo(appID){
  
  console.log("generateSteamGameInfo");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
 
  let gameInfo = {appid : appID};
  
  try{
    const productInfo = await productInfoRequest(appID);

    gameInfo.name = productInfo.common.name;
    gameInfo.binary = findBinary(productInfo.config.launch);
    gameInfo.icon = productInfo.common.icon;
      
  }catch(err){
    
  console.warn(err);
    
  /*Do nothing*/
    
  }
  
  if (!gameInfo.name || !gameInfo.binary || !gameInfo.icon) 
  {
  
  console.log("> scraping store, steamdb, etc ...");
  
    const promises = [
      getDataFromSteamStoreFallbackStoreAPI(appID),
      getDataFromSteamDB(appID),
      findInAppList(appID)
    ];

    const [steamStore, steamDB, app] = await Promise.allSettled(promises);
    
    console.log("---------");
    
    console.log(steamStore);
    console.log(steamDB);
    console.log(app);
      
    gameInfo.name = steamStore.value?.name || steamDB.value?.name || app.value?.name
    gameInfo.binary = steamDB.value?.binary;
    gameInfo.icon = steamStore.value?.icon || steamDB.value?.icon;
    
    console.log(gameInfo);
    
    console.log("---------");
  
  }
  
  if (!gameInfo.name) throw "EUNEXPECTEDNONAMEFOUND";
  
  return gameInfo;
  
}

async function generateAchievementList(appID,lang = "english"){
  
  console.log("generateAchievementList");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  if (!languages.some( language => language.api === lang )) throw "EUNSUPPORTEDLANG";

  const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${apiKey.steam.web_api[0]}&appid=${appID}&l=${lang}&format=json`;
  const filepath = path.join(folder.cache,"steam/schema",lang,`${appID}.json`);  
       
  let data = {
    current : await request.getJson(url),
    previous : null
  };
      
  if (!data.current.game.availableGameStats?.achievements) throw "ENOACHIEVEMENT";
      
  let version = {
    current: +data.current.game.gameVersion,
    previous: 0 
  };
      
  if (await fs.exists(filepath)) 
  {  
    try{
      data.previous = JSON.parse(await fs.readFile(filepath));
      version.previous = +data.previous.achievement.version;
    }catch{
       data.previous = null;
       version.previous = 0;
    }
   }
      
   let result;
   
   if (!data.previous || version.current > version.previous) 
   {
     
     console.log("> generating from remote");
     
     let achievements = data.current.game.availableGameStats.achievements;
        
     const hiddenCount = achievements.reduce((a, c) => (c.hidden && !c.description) ? ++a : a, 0);
     let achievementstatsAPI;
     if (hiddenCount > 0) 
     {
       console.log("> has some hidden ach");
       try{
         achievementstatsAPI = await getHiddenDescriptionFromCacheOrRemote(appID);
       }catch(err){
         console.warn(err);
         achievementstatsAPI = null;
       }
     }
        
     for ( let i in achievements)
     {
       achievements[i].icon = achievements[i].icon.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0].replace(".jpg","");
       try{
		achievements[i].icongray = achievements[i].icongray.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0].replace(".jpg","");
	   }catch{ //Some have none (hidden ach) or point to root url(403) eg: 692850
		delete achievements[i].icongray;
	   }
          
       try{
         if(achievements[i].hidden && !achievements[i].description && achievementstatsAPI) 
         {
          achievements[i].description = achievementstatsAPI.find( ach => ach.apiName.toLowerCase() === achievements[i].name.toLowerCase())?.description || achievementstatsAPI[i].description;
         }
       }catch{/*Do nothing*/
        console.warn(`${achievements[i].name} no hidden desc found !`);
       }
          
       //Sometimes vendor forget to un-escape char especially with non-english language
       //Example: Gears Tactics in French (xml char)
       achievements[i].displayName = unescape(achievements[i].displayName);
       if(achievements[i].description) achievements[i].description = unescape(achievements[i].description);
          
       delete achievements[i].defaultvalue;
      }
        
      result = { total: achievements.length, version: version.current, list: achievements };  
    } 
    else 
    {
      result = data.previous;
    }
      
    fs.writeFile(filepath,JSON.stringify(result, null, 2)).catch(()=>{});
      
    return result;
}