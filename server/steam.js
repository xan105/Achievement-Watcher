"use strict";

const path = require('path');
const htmlParser = require('node-html-parser').parse;
const request = require('request-zero');
const aes = require("./util/aes.js");
const ffs = require(require.resolve("./util/feverFS.js"));
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/steam.log")
});

const keychain = require("./key.json");
const cache = require("./cache.json");
const steamLanguages = require("./steamLanguages.json");

const key = {
  schema : aes.decrypt(keychain.schema),
  userStats : aes.decrypt(keychain.userStats)
}

module.exports.getSchema = async (appID,lang = "english") => {
  try {
  
    debug.log(`Loading ${appID} - ${lang}`);
  
    if (!steamLanguages.some( language => language.api === lang )) {
        throw "Unsupported API language code";
    }

    let filePath = path.join(`${cache.dir}`,`steam/ach/${lang}`,`${appID}.json`);
    let ach;
    if (await ffs.promises.existsAndIsYoungerThan(filePath,{timeUnit: 'month', time: 1})) {
       ach = JSON.parse(await ffs.promises.readFile(filePath));
       debug.log("Loading achievements list from cache");
    } else {
      try{
         ach = await getSteamAchData(appID,lang);
         debug.log("Loading achievements list from remote");
         ffs.promises.writeFile(filePath,JSON.stringify(ach, null, 2)).catch((err) => { debug.log(err) });    
      }catch(err){
         if (await ffs.promises.exists(filePath)){
          debug.log(err);
          ach = JSON.parse(await ffs.promises.readFile(filePath));
          debug.log("Falling back to cached data");
         } else {
          throw err;
         }
      }             
    } 
    
    let header = await getSteamHeaderData(appID);

    return Object.assign(header,ach);
    
  }catch(err) {
    debug.log(err);
    throw err
  }
}

module.exports.getUserStats = async (user, appID) => {

  const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appID}&key=${key.userStats}&steamid=${user}"`;

  try {

    let result = await request.getJson(url);
    return result.playerstats.achievements;
    
  }catch(err){
    debug.log(err);
    throw err
  }

};

module.exports.getUserOwnedGames = async (user) => {

  const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key.userStats}&steamid=${user}&include_played_free_games=true&format=json`;

  try {

    let result = await request.getJson(url);
    
    if(Object.keys(result.response).length === 0) throw 403;

    return result.response 

  }catch(err){
    debug.log(err);
    throw err
  }

};

async function getSteamHeaderData(appID) {
  try{
  
    const urls = {
      store: `https://store.steampowered.com/app/${appID}`,
      cdn: `https://steamcdn-a.akamaihd.net` 
    };
  
    let save = false;
    let filePath = path.join(`${cache.dir}`,"steam/game",`${appID}.json`);
    
    let result = {
      name: null,
      appid : appID,
      binary: null,
      img: {}
    };
    
    if (await ffs.promises.exists(filePath)) {
      result = JSON.parse(await ffs.promises.readFile(filePath));
      debug.log("Loading header from cache");
    } else {
      save = true;
    }
    
    if (!result.img) result.img = {};
    if (!result.img.header || !result.img.background || !result.img.portrait || !result.img.hero) {
      save = true;
      if (!result.img.header) result.img.header = `${urls.cdn}/steam/apps/${appID}/header.jpg`;
      if (!result.img.background) result.img.background = `${urls.cdn}/steam/apps/${appID}/page_bg_generated_v6b.jpg`;
      try{
        if (!result.img.portrait && (await request.head(`${urls.cdn}/steam/apps/${appID}/library_600x900.jpg`, {maxRetry: 0})).code == 200 ) result.img.portrait = `${urls.cdn}/steam/apps/${appID}/library_600x900.jpg`;
        if (!result.img.hero && (await request.head(`${urls.cdn}/steam/apps/${appID}/library_hero.jpg`, {maxRetry: 0})).code == 200) result.img.hero = `${urls.cdn}/steam/apps/${appID}/library_hero.jpg`;
      }catch(err){
        debug.log(err);
      }
    }

    if (!result.name || !result.img.icon) {
          debug.log("Loading header from remote");
          
          let data = await request(urls.store,{headers: {'Cookie': "birthtime=662716801; mature_content=1; path=/; domain=store.steampowered.com", "Accept-Language" : "en-US;q=1.0"}});
          let html = htmlParser(data.body);
          let name = html.querySelector('.apphub_AppName').innerHTML;
          let icon_URL = html.querySelector('.apphub_AppIcon img').attributes.src;
          save = true;
          
          if (!result.name) result.name = name
          if (!result.img.icon) result.img.icon = icon_URL.replace("https://%CDN_HOST_MEDIA_SSL%",urls.cdn);
            
   }
    
   //if (!result.binary || !result.name || !result.img.icon) {
   if (!result.binary) {
      try{
        let data = await scrapSteamDB(appID);
        save = true;
        //if (!result.name) result.name = data.name;
        //if (!result.img.icon) result.img.icon = data.icon;
        //if (!result.binary) result.binary = path.parse(data.binary).base;
        if (!result.binary) result.binary = data;
        debug.log("Loading info from SteamDB");
      }catch(err){
        debug.log(err);
      }
   }

   if (save) ffs.promises.writeFile(filePath,JSON.stringify(result, null, 2)).catch((err) => { debug.log(err) }); 
   
   return result;
    
  }catch(err){
    debug.log(err);
    throw err;
  }
}

function getSteamAchData(appID,lang) {

  const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${key.schema}&appid=${appID}&l=${lang}&format=json`;

  return new Promise((resolve, reject) => {
    return request.getJson(url).then((data)=>{
      
      try {
    
        let schema = data.game.availableGameStats;
        
        let result = {
          achievement: {
                total: schema.achievements.length,
                list: schema.achievements
          }
        };
        
        return resolve(result);
      
      }catch(err){
        debug.log(err);
        return reject(err);
      }
    
    }).catch((err) => {
      debug.log(err);
      return reject(err);
    });
    
  });
}

async function scrapSteamDB(appID){
  
  //const url = `https://steamdb.info/app/${appID}/`;
  const url = `https://steamdb.info/app/${appID}/config`;

  try {

    let options = { 
      maxRetry: 0,
      timeout: 5000,
      headers: { 
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71) Gecko/20100101 Firefox/71`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': '*',
        'DNT': 1,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': 1
      }
    };

    //let data = await request(url);
    let data = await request(`https://googleweblight.com/?lite_url=${url}`,options);    
    
    let html = htmlParser(data.body);

    /*let binaries = html.querySelector('#config table tbody').innerHTML.split("</tr>\n<tr>").map((tr) => {
    
      let data = tr.split("</td>\n");

      return {
        executable: data[1].replace(/<\/?[^>]+>/gi, '').replace(/[\r\n]/g, ''),
        windows: data[4].includes(`aria-label="windows"`) || (!data[4].includes(`aria-label="macOS"`) && !data[4].includes(`aria-label="Linux"`)) ? true : false,
      };
    
    });
    
    let result = {
      binary: binaries.find(binary => binary.windows).executable,
      icon: html.querySelector('.app-icon.avatar').attributes.src,
      header: html.querySelector('.app-logo').attributes.src,
      name: html.querySelector('.css-truncate').innerHTML
    };
    
    try {
      let info = html.querySelector('#info table tbody').innerHTML.split("</tr>\n<tr>");
      result.lang = htmlParser(info.find(entry => entry.includes("Achievement Languages"))).querySelector('.app-json').innerHTML.split("</li><li>").map((tr) => {
        return htmlParser(tr).querySelector('i').innerHTML.replace(":","");
      }); 
    }catch(e){}

    return result*/
    
    let binaries = html.querySelector('#a-config table tbody').innerHTML.split("</tr><tr>").map((tr) => {
    
      let data = tr.split("</td>");

      return {
        executable: data[1].replace(/<\/?[^>]+>/gi, '').replace(/[\r\n]/g, ''),
        windows: data[4].includes(`aria-label="windows"`) || (!data[4].includes(`aria-label="macOS"`) && !data[4].includes(`aria-label="Linux"`)) ? true : false,
      };
    
    });

    let binary = binaries.find(binary => binary.windows).executable;
    binary = binary.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0];
    
    if (!binary) throw "No binary match";

    return binary;    
    
  }catch( err) {
    debug.log(err);
    throw err;
  }
}