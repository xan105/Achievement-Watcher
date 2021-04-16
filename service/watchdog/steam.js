"use strict";

const path = require('path');
const urlParser = require('url');
const fs = require("@xan105/fs");
const request = require('request-zero');
const steamLang = require("./steam.json");

module.exports.loadSteamData = async (appID, lang, key) => {

  if (!steamLang.some( language => language.api === lang )) {
        throw "Unsupported API language code";
  }
  
  const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/schema",lang);

  try {
  
    let filePath = path.join(`${cache}`,`${appID}.db`);
    let result;

    if (await fs.existsAndIsYoungerThan(filePath,{timeUnit: 'M', time: 1})) {
        result = JSON.parse(await fs.readFile(filePath));
    } else {
        if (key) {
          result = await getSteamData(appID, lang, key);
        } else {
          result = await getSteamDataFromSRV(appID, lang);
        }
        fs.writeFile(filePath,JSON.stringify(result, null, 2)).catch((err) => { console.log(err) });                 
   }
   
   return result;
   
 }catch(err) {
  throw `Could not load Steam data for ${appID} - ${lang}: ${err}`
 }
 
}

module.exports.fetchIcon = async (url,appID) => {
  try{
  
    const cache = path.join(process.env['APPDATA'],`Achievement Watcher/steam_cache/icon/${appID}`);

    const filename = path.parse(urlParser.parse(url).pathname).base;

    let filePath = path.join(cache,filename);

    if (await fs.exists(filePath)) {
      return filePath;
    } else {
      return (await request.download(url,cache)).path;
    }

  }catch(err){
    return url;
  }
}

function getSteamDataFromSRV(appID,lang){

  const url = `https://api.xan105.com/steam/ach/${appID}?lang=${lang}`;
  
  return new Promise((resolve, reject) => {
  
    request.getJson(url).then((data) => {
      
      if (data.error) {
        return reject(data.error);
      } else if (data.data){
        return resolve(data.data);
      } else {
        return reject("Unexpected Error");
      }
      
    }).catch((err) => {
      return reject(err);
    });
  
  });
}

async function getSteamData (appID,lang,key) {
  
  const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${key}&appid=${appID}&l=${lang}&format=json`;

  const data = await request.getJson(url);
  
  const schema = data.game.availableGameStats;
  if (!(schema && schema.achievements && schema.achievements.length > 0)) throw "Schema doesn't have any achievement";

  const result = {
    name: await findInAppList(+appID), 
    appid: appID,
    binary: null,
    img: {
      header: `https://cdn.akamai.steamstatic.com/steam/apps/${appID}/header.jpg`,
      background: `https://cdn.akamai.steamstatic.com/steam/apps/${appID}/page_bg_generated_v6b.jpg`,
      portrait: `https://cdn.akamai.steamstatic.com/steam/apps/${appID}/library_600x900.jpg`,
      icon: null
    },
    achievement: {
      total: schema.achievements.length,
      list: schema.achievements
    }
  };
          
  return result;
}

async function findInAppList(appID){
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "ERR_INVALID_APPID";
  
  const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/schema");
  const filepath = path.join(cache,"appList.json");
  
  try
  {
    const list = JSON.parse(await fs.readFile(filepath));
    const app = list.find(app => app.appid === appID);
    if (!app) throw "ERR_NAME_NOT_FOUND";
    return app.name; 
  } 
  catch
  {
    const url = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json";
    
    const data = await request.getJson(url,{timeout: 4000});
    
    let list = data.applist.apps;
    list.sort((a, b) => b.appid - a.appid); //recent first
    
    await fs.writeFile(filepath,JSON.stringify(list, null, 2));
    
    const app = list.find(app => app.appid === appID);
    if (!app) throw "ERR_NAME_NOT_FOUND"; 
    return app.name;
  }
}