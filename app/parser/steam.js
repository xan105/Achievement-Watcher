"use strict";

const { remote } = require('electron');
const path = require("path");
const glob = require("fast-glob");
const normalize = require('normalize-path');
const ini = require("ini");
const omit = require('lodash.omit');
const moment = require('moment');
const request = require('request-zero');
const urlParser = require('url');
const ffs = require("@xan105/fs");
const htmlParser = require('node-html-parser').parse;
const regedit = require('regodit');
const steamID = require(path.join(appPath,"util/steamID.js"));
const steamLanguages = require(path.join(appPath,"locale/steam.json"));
const sse = require(path.join(appPath,"parser/sse.js"));

const cacheRoot = remote.app.getPath('userData');

module.exports.scan = async (additionalSearch = []) => {
  try {

    let search = [
        path.join(process.env['Public'],"Documents/Steam/CODEX"), 
        path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves"),
        path.join(process.env['APPDATA'],"EMPRESS"),
        path.join(process.env['APPDATA'],"Steam/CODEX"),
        path.join(process.env['PROGRAMDATA'],"Steam")+"/*",
        path.join(process.env['LOCALAPPDATA'],"SKIDROW"),
        path.join(process.env['APPDATA'],"SmartSteamEmu"),
        path.join(process.env['APPDATA'],"CreamAPI")
    ];
    
    const mydocs = await regedit.promises.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","Personal");
    if (mydocs) {
      search = search.concat([
        path.join(mydocs,"Skidrow")
      ]);
    }
    
    if(additionalSearch.length > 0) search = search.concat(additionalSearch);
    
    search = search.map((dir) => { return normalize(dir) + "/([0-9]+)" });
    
    let data = [];
    for (let dir of await glob(search,{onlyDirectories: true, absolute: true})) {
    
                let game = { 
                    appid: path.parse(dir).name, 
                    data: {
                      type: "file",
                      path: dir }
                };
                
                if (dir.includes("CODEX")) {
                  game.source = "Codex";
                } else if (dir.includes("Goldberg")){
                  game.source = "Goldberg";
				} else if (dir.includes("EMPRESS")){
                  game.source = "Goldberg (EMPRESS)";
                  game.data.path = path.join(game.data.path,"remote",game.appid);
                } else if (dir.includes("SKIDROW")){
                  game.source = "Skidrow";
                } else if (dir.includes("SmartSteamEmu")){
                  game.source = "SmartSteamEmu";
                } else if (dir.includes("ProgramData/Steam")){
                  game.source = "Reloaded - 3DM";
                } else if (dir.includes("CreamAPI")){
                  game.source = "CreamAPI";
                }

                data.push(game);
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
  
         let steamPath = await getSteamPath();
         let publicUsers = await getSteamUsers(steamPath);

         let steamCache = path.join(steamPath,"appcache/stats");
         let list = (await glob("UserGameStats_*([0-9])_*([0-9]).bin",{cwd: steamCache, onlyFiles: true, absolute: false})).map((filename) => {
            let matches = filename.match(/([0-9]+)/g);
            return {
              userID : matches[0],
              appID: matches[1]
            };
         });
     
         for (let stats of list) {

             let isInstalled = true;
             if (listingType == 1) isInstalled = (await regedit.promises.RegQueryIntegerValue("HKCU",`Software/Valve/Steam/Apps/${stats.appID}`,"Installed") === "1") ? true : false;
                                 
             let user = publicUsers.find(user => user.user == stats.userID);
             
             if ( user && isInstalled) {
            
                  data.push({appid: stats.appID,
                             source: `Steam (${user.name})`,
                             data: {
                                type: "steamAPI",
                                userID: user,
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

  const cache = path.join(cacheRoot,"steam_cache/schema",cfg.lang);

  try {
  
    let filePath = path.join(`${cache}`,`${cfg.appID}.db`);
    
    let result;

    if (await ffs.existsAndIsOlderThan(filePath,{timeUnit: 'month', time: 1, younger: true})) {
        result = JSON.parse(await ffs.readFile(filePath));
    } else {
        if (cfg.key) {
          result = await getSteamData(cfg);
        } else {
          result = await getSteamDataFromSRV(cfg.appID, cfg.lang);
        }
        ffs.writeFile(filePath,JSON.stringify(result, null, 2)).catch((err) => {});                 
   }
   
   return result;
   
 }catch( err) {
  throw "Could not load Steam data."
 }
}

module.exports.getAchievementsFromFile = async (filePath) => {
  try {

  const files = [
    "achievements.ini",
    "achievements.json",
    "achiev.ini",
    "stats.ini",
    "Achievements.Bin",
    "achieve.dat",
    "Achievements.ini",
    "stats/achievements.ini",
    "stats.bin",
    "stats/CreamAPI.Achievements.cfg"
  ];
  
  const filter = ["SteamAchievements","Steam64","Steam"];
  
  let local;                            
  for (let file of files) {
     try {

       if (path.parse(file).ext == ".json") {
          local = JSON.parse(await ffs.readFile(path.join(filePath,file),"utf8"));
       } else if (file === "stats.bin"){
          local = sse.parse(await ffs.readFile(path.join(filePath,file)));
       } else {
          local = ini.parse(await ffs.readFile(path.join(filePath,file),"utf8"));
       }
       break;
     } catch (e) {}
  }              
  if(!local) throw `No achievement file found in '${filePath}'`; 
                          
  let result = {};                     
  
  if (local.AchievementsUnlockTimes && local.Achievements) { //hoodlum DARKSiDERS
    
    for (let i in local.Achievements) {
        if (local.Achievements[i] == 1) {
          result[`${i}`] = { Achieved: "1", UnlockTime: local.AchievementsUnlockTimes[i] || null };
        }
    }
  } else if (local.State && local.Time ) { //3DM
  
      for (let i in local.State) {
        if(local.State[i] == '0101'){
          result[i] = { Achieved: "1", UnlockTime: new DataView(new Uint8Array(Buffer.from(local.Time[i].toString(),'hex')).buffer).getUint32(0, true) || null }; 
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
     } else if (result[i].unlocktime && result[i].unlocktime.length === 7){ //creamAPI
        result[i].unlocktime = +result[i].unlocktime * 1000 //cf: https://cs.rin.ru/forum/viewtopic.php?p=2074273#p2074273 | timestamp is invalid/incomplete
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
      local : path.join(cacheRoot,"steam_cache/user",cfg.user.user,`${cfg.appID}.db`),
      steam : path.join(`${cfg.path}`,`UserGameStats_${cfg.user.user}_${cfg.appID}.bin`)
    };
    
    let time = {
      local : 0,
      steam: 0
    };
    
    let local = await ffs.stats(cache.local);
    if (Object.keys(local).length > 0) {
      time.local = moment(local.mtime).valueOf();
    }

    let steamStats = await ffs.stats(cache.steam);
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
        ffs.writeFile(cache.local,JSON.stringify(result, null, 2)).catch((err) => {});

    } else {
      result = JSON.parse(await ffs.readFile(cache.local));
    }

   return result;
   
 }catch(err) {
  throw "Could not load Steam User Stats."
 }
 
}

async function getSteamPath(){
  try {
  
     /*
       Some SteamEmu change HKCU/Software/Valve/Steam/SteamPath to the game's dir
       Fallback to Software/WOW6432Node/Valve/Steam/InstallPath in this case 
       NB: Steam client correct the key on startup
     */

     const regHives = [
        {root: "HKCU", key: "Software/Valve/Steam", name: "SteamPath"},
        {root: "HKLM", key: "Software/WOW6432Node/Valve/Steam", name: "InstallPath"} 
     ];

     let steamPath;

     for (let regHive of regHives) {
          
        steamPath = await regedit.promises.RegQueryStringValue(regHive.root,regHive.key,regHive.name);
        if (steamPath) {
           if (await ffs.exists(path.join(steamPath,"steam.exe"))){
             break;
           }
        }  
     }
  
     if (!steamPath) throw "Steam Path not found";
     return steamPath;
    
   }catch(err){
      throw err;
   }
}

async function getSteamUsers(steamPath) {
     try {
            
        let result = [];
       
        let users = await regedit.promises.RegListAllSubkeys("HKCU","Software/Valve/Steam/Users");
        if (!users) users = await glob("*([0-9])",{cwd: path.join(steamPath,"userdata"), onlyDirectories: true, absolute: false}); 
     
        if (users.length == 0) throw "No Steam User ID found";
            for (let user of users) {
               let id = steamID.to64(user);
               let data = await steamID.whoIs(id);
               
               if (data.privacyState === "public") {
                   debug.log(`${user} - ${id} (${data.steamID}) is public`);
                   result.push({
                      user: user,
                      id: id,
                      name: data.steamID
                   }); 
                } else {
                   debug.log(`${user} - ${id} (${data.steamID}) is not public`);
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
      binary: binaries.find(binary => binary.windows).executable.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0], 
      icon: html.querySelector('.app-icon.avatar').attributes.src,
      header: html.querySelector('.app-logo').attributes.src,
      name: html.querySelector('.css-truncate').innerHTML
    };

    return result
    
  }catch( err) {
    throw err;
  }
}