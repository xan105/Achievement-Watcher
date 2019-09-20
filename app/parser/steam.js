"use strict";

const { remote } = require('electron');
const path = require("path");
const glob = require("fast-glob");
const ini = require("ini");
const omit = require('lodash.omit');
const moment = require('moment');
const request = require('request-zero');
const ffs = require(path.join(appPath,"util/feverFS.js"));
const htmlParser = require('node-html-parser').parse;
const regedit = require(path.join(appPath,"native/regedit/regedit.js"));
const steamID = require(path.join(appPath,"util/steamID.js"));
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

module.exports.scan = async (additionalSearch = []) => {
  try {

    let search = [
        path.join(process.env['Public'],"Documents/Steam/CODEX"), 
        path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves"),
        path.join(process.env['APPDATA'],"Steam/CODEX"),
        path.join(process.env['PROGRAMDATA'],"Steam")+"/*",
        path.join(process.env['LOCALAPPDATA'],"SKIDROW"),
        path.join(process.env['APPDATA'],"SmartSteamEmu")
    ];
    
    let mydocs = regedit.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","Personal");
    if (mydocs && mydocs != "") {
      search = search.concat([
        path.join(mydocs,"Skidrow"),
        path.join(mydocs,"HLM"),
        path.join(mydocs,"DARKSiDERS")
      ]);
    }
    
    if(additionalSearch.length > 0) search = search.concat(additionalSearch);
    
    search = search.map((dir) => { return dir+"/([0-9]+)/" });
    
    let data = [];
    for (let dir of await glob(search,{onlyDirectories: true, absolute: true})) {
                data.push({ appid: path.parse(dir).name, 
                           data: {
                           type: "file",
                           path: dir}
                });
    };    
    return data;
  
  }catch(err){
      throw err;
  }
}

module.exports.scanLegit = async (listingType = 0) => {
  try {
  
  let data = [];
  
  if (regedit.RegKeyExists("HKCU","Software/Valve/Steam") && listingType > 0){ 
  
        const steamPath = regedit.RegQueryStringValue("HKCU","Software/Valve/Steam","SteamPath");
        if (!steamPath) throw "Steam Path not found";
        
         let userID = await getSteamUsers(steamPath);

         let steamCache = path.join(steamPath,"appcache/stats");
         let steamAppIDList = (await glob("UserGameStatsSchema_*([0-9]).bin",{cwd: steamCache, onlyFiles: true, absolute: false})).map(filename => filename.match(/([0-9]+)/g)[0]);
     
         for (let appid of steamAppIDList) {
          
             let hasStatsSchema = await ffs.promises.exists(path.join(steamCache,`UserGameStatsSchema_${appid}.bin`));

             let isInstalled = true;
             if (listingType == 1) {
                isInstalled = (regedit.RegQueryIntegerValue("HKCU",`Software/Valve/Steam/Apps/${appid}`,"Installed") === "1") ? true : false;
             }
                                 
             if ( hasStatsSchema && isInstalled) {
            
                  data.push({appid: appid,
                             data: {
                                type: "steamAPI",
                                userID: userID,
                                cachePath: steamCache
                             }
                  });
            }       
          }
    } else {
      throw "Legit Steam not found or disabled.";
    }
  
  return data;
  
  }catch(err){
      throw err;
  }
}

module.exports.getGameData = async (cfg) => {
  if (!steamLanguages.some( language => language.api === cfg.lang )) {
        throw "Unsupported API language code";
  }

  const cache = path.join(remote.app.getPath('userData'),"steam_cache/schema",cfg.lang);

  try {
  
    let filePath = path.join(`${cache}`,`${cfg.appID}.db`);
    
    let result;

    if (await ffs.promises.existsAndIsYoungerThan(filePath,{timeUnit: 'month', time: 1})) {
        result = JSON.parse(await ffs.promises.readFile(filePath));
    } else {
        if (cfg.key) {
          result = await getSteamData(cfg);
        } else {
          result = await getSteamDataFromSRV(cfg.appID, cfg.lang);
        }
        ffs.promises.writeFile(filePath,JSON.stringify(result, null, 2)).catch((err) => {});                 
   }
   
   return result;
   
 }catch( err) {
  throw "Could not load Steam data."
 }
}

module.exports.getAchievementsFromFile = async (filePath) => {
  try {
  
  const files = ["achievements.ini","stats/achievements.ini","Achievements.Bin" ,"achieve.dat", "stats.ini", "SteamEmu/stats.ini"];
  const filter = ["SteamAchievements","Steam64","Steam"];
  
  let local;                            
  for (let file of files) {
     try {
       local = ini.parse(await ffs.promises.readFile(path.join(filePath,file),"utf8"));
       break;
     } catch (e) {}
  }              
  if(!local) throw "No achievement file found"; 
                          
  let result = {};                     
  
  if (local.AchievementsUnlockTimes && local.Achievements) { //hoodlum DARKSiDERS
    
    for (let i in local.Achievements) {
        if (local.Achievements[i] == 1) {
          result[`${i}`] = { Achieved: "1", UnlockTime: local.AchievementsUnlockTimes[i] || null };
        }
    }

  } else {
    result = omit(local.ACHIEVE_DATA || local, filter);
  }

  for (let i in result) {
     if(result[i].State) { //RLD!
          try{  
            //uint32 little endian
            result[i].State = new DataView(new Uint8Array(Buffer.from(result[i].State.toString(),'hex')).buffer).getUint32(0, true);
            result[i].CurProgress = new DataView(new Uint8Array(Buffer.from(result[i].CurProgress.toString(),'hex')).buffer).getUint32(0, true);
            result[i].MaxProgress = new DataView(new Uint8Array(Buffer.from(result[i].MaxProgress.toString(),'hex')).buffer).getUint32(0, true);
            result[i].Time = new DataView(new Uint8Array(Buffer.from(result[i].Time.toString(),'hex')).buffer).getUint32(0, true);   
          }catch(e){} 
     } else {
        break;
     }  
  }

  return result;
  
  }catch(err){
      throw err;
  }
}

module.exports.getAchievementsFromAPI = async(cfg) => {

  try {
  
    let result;
  
    let cache = {
      local : path.join(remote.app.getPath('userData'),"steam_cache/user",cfg.user.user,`${cfg.appID}.db`),
      steam : path.join(`${cfg.path}`,`UserGameStats_${cfg.user.user}_${cfg.appID}.bin`)
    };
    
    let time = {
      local : 0,
      steam: 0
    };
    
    let local = await ffs.promises.stats(cache.local);
    if (Object.keys(local).length > 0) {
      time.local = moment(local.mtime).valueOf();
    }

    let steamStats = await ffs.promises.stats(cache.steam);
    if (Object.keys(steamStats).length > 0) {
      time.steam = moment(steamStats.mtime).valueOf();
    }else{
      throw "No Steam cache file found"
    }
    
    if (time.steam > time.local) {
        if (cfg.key) {
          result = await getSteamUserStats(cfg);
        } else {
          result = await getSteamUserStatsFromSRV(cfg.user.id,cfg.appID);
        }
        ffs.promises.writeFile(cache.local,JSON.stringify(result, null, 2)).catch((err) => {});

    } else {
      result = JSON.parse(await ffs.promises.readFile(cache.local));
    }

   return result;
   
 }catch(err) {
  throw "Could not load Steam User Stats."
 }
 
}

async function getSteamUsers(steamPath) {
     try {
            
        let result = [];
       
        let users = regedit.RegListAllSubkeys("HKCU","Software/Valve/Steam/Users");
        if (!users) users = await glob("*([0-9])/",{cwd: path.join(steamPath,"userdata"), onlyDirectories: true, absolute: false}); 
     
        if (users.length == 0) throw "No Steam User ID found";
            for (let user of users) {
               let id = steamID.to64(user);
               if (await steamID.isPublic(id)) { 
                   debug.log(`${user} - ${id} is public`);
                   result.push({
                      user: user,
                      id: id
                   }); 
                } else {
                   debug.log(`${user} - ${id} is not public`);
                }
             }
                
         if (result.length > 0) {
             return result;
         } else {
             throw "Public profile: none.";
         }
            
     }catch(err){
         throw err;
     }
          
}

function getSteamUserStatsFromSRV(user,appID) {

  const url = `https://api.xan105.com/steam/user/${user}/stats/${appID}`;
  
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

async function getSteamUserStats(cfg) {

  const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${cfg.appID}&key=${cfg.key}&steamid=${cfg.user.id}"`;

  try {

    let result = await request.getJson(url);
    return result.playerstats.achievements;
    
  }catch(err){
    throw err
  }

};

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

function getSteamData(cfg) {
  
  const url = {
    api : `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${cfg.key}&appid=${cfg.appID}&l=${cfg.lang}&format=json`,
    store : `https://store.steampowered.com/api/appdetails?appids=${cfg.appID}` 
  };
  
  return new Promise((resolve, reject) => {
  
      Promise.all([request.getJson(url.api),request.getJson(url.store,{headers: {"Accept-Language" : "en-US;q=1.0"}}),scrapSteamDB(cfg.appID)]).then(function(data) {

        try {

          let schema = data[0].game.availableGameStats;
          let appdetail = data[1][cfg.appID].data;
          let steamdb = data[2];

          let result = {
            name: (data[1][cfg.appID].success) ? appdetail.name : steamdb.name, //If the game is no longer available in the store fallback to steamdb
            appid: cfg.appID,
            binary: path.parse(steamdb.binary).base,
            img: {
              header: (data[1][cfg.appID].success) ? appdetail.header_image.split("?")[0] : steamdb.header, //If the game is no longer available in the store fallback to steamdb
              background: (data[1][cfg.appID].success) ? appdetail.background.split("?")[0] : null,
              icon: steamdb.icon
            },
            achievement: {
              total: schema.achievements.length,
              list: schema.achievements
            }
          };
          
          return resolve(result);
          
        }catch(err) {
            return reject(err);
        }
        
      }).catch((err) => {
          return reject(err);
      });
  });
}

async function scrapSteamDB(appID){
  try {
    let data = await request(`https://steamdb.info/app/${appID}/`);
    let html = htmlParser(data.body);

    let binaries = html.querySelector('#config table tbody').innerHTML.split("</tr>\n<tr>").map((tr) => {
    
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

    return result
    
  }catch( err) {
    throw err;
  }
}