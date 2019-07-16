"use strict";

const path = require('path');
const htmlParser = require('node-html-parser').parse;
const request = require(require.resolve("./util/request.js"));
const aes = require("./util/aes.js");
const ffs = require(require.resolve("./util/feverFS.js"));
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/ach.log")
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
  
    let result;
  
    let filePath = path.join(`${cache.dir}`,"game",`${appID}.json`);
    let header;
    if (await ffs.promises.existsAndIsYoungerThan(filePath,{timeUnit: 'month', time: cache.data_retention.header})) {
        header = JSON.parse(await ffs.promises.readFile(filePath));
        debug.log("Loading header from cache");
    } else {
        header = await getSteamHeaderData(appID);
        debug.log("Loading header from remote");
        ffs.promises.writeFile(filePath,JSON.stringify(header, null, 2)).catch((err) => { debug.log(err) });                 
   }
   
   if (!header.game_lang.some( language => language.api === lang )) {
      debug.log("Game doesnt support language; Switching back to English");
      lang = "english";
   }
   
   filePath = path.join(`${cache.dir}`,`ach/${lang}`,`${appID}.json`);
   let ach;
   if (await ffs.promises.existsAndIsYoungerThan(filePath,{timeUnit: 'month', time: cache.data_retention.ach})) {
        ach = JSON.parse(await ffs.promises.readFile(filePath));
        debug.log("Loading achievements list from cache");
   } else {
        ach = await getSteamAchData(appID,lang);
        debug.log("Loading achievements list from remote");
        ffs.promises.writeFile(filePath,JSON.stringify(ach, null, 2)).catch((err) => { debug.log(err) });                 
   } 
 
   result = Object.assign(header,ach);
  
   return result;
    
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

function getSteamHeaderData(appID) {

  const url = `https://store.steampowered.com/api/appdetails?appids=${appID}`;

  return new Promise((resolve, reject) => {
  
   return Promise.all([request.getJson(url,{headers: {"Accept-Language" : "en-US;q=1.0"}}), scrapSteamDB(appID)]).then(function(data) {  

          try {
          
              let appdetail = data[0];
              let steamdb = data[1];

                let result = {
                  name: appdetail[appID].data.name,
                  appid: appID,
                  binary: path.parse(steamdb.binary).base,
                  img: {
                    header: appdetail[appID].data.header_image.split("?")[0],
                    background: appdetail[appID].data.background.split("?")[0],
                    icon: steamdb.icon
                  },
                  game_lang: appdetail[appID].data.supported_languages.split("<br>")[0].replace(/<\/?[^>]+>\*<\/?[^>]+>/gi,"").split(", ").map((i)=>{ 
                                return i = steamLanguages.find( lang => lang.displayName === i)
                             })
                };

              return resolve(result); 
          
          }catch(err) {
            debug.log(err);
            return reject(err);
          }   
    
   }).catch((err) => {
          debug.log(err);
          return reject(err);
   });

  });
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
  
  const url = `https://steamdb.info/app/${appID}/`;

  try {
    let data = await request(url);
    let html = htmlParser(data);

    let binaries = html.querySelector('#config table tbody').innerHTML.split("</tr>\n<tr>").map((tr) => {
    
      let data = tr.split("</td>\n");

      return {
        executable: data[1].replace(/<\/?[^>]+>/gi, '').replace(/[\r\n]/g, ''),
        windows: data[4].includes(`aria-label="windows"`) || (!data[4].includes(`aria-label="macOS"`) && !data[4].includes(`aria-label="Linux"`)) ? true : false,
      };
    
    });

    let result = {
      icon: html.querySelector('.app-icon.avatar').attributes.src,
      binary: binaries.find(binary => binary.windows).executable 
    };
    
    return result
    
  }catch( err) {
    debug.log(err);
    throw err;
  }
}