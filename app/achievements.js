"use strict";

const { remote } = require('electron');
const path = require("path");
const util = require("util");
const glob = require("fast-glob");
const ini = require("ini");
const omit = require('lodash.omit');
const moment = require('moment');
const request = require(require.resolve("./util/request.js"));
const ffs = require(require.resolve("./util/feverFS.js"));
const htmlParser = require('node-html-parser').parse;
const regedit = require(path.join(remote.app.getAppPath(),"native/regedit/regedit.js"));
const steamID = require(require.resolve("./util/steamID.js"));

const steamLanguages = require("./locale/steam.json");
const userdir = path.join(remote.app.getPath('userData'),"cfg/userdir.db");
const exclusion = path.join(remote.app.getPath('userData'),"cfg/exclusion.db");

const debug = new (require(path.join(appPath,"util/log.js")))({
  console: remote.getCurrentWindow().isDev || false,
  file: path.join(remote.app.getPath('userData'),"logs/parser.log")
});

const rpcs3 = require(require.resolve("./rpcs3.js"));

module.exports.makeList = async(option, callbackProgress = ()=>{}) => {

  try {

      let result = [];
  
      let appidList = await discover(option.steam);

      if ( appidList.length > 0) {
        let count = 1;

        for (let appid of appidList) {

            let percent = Math.floor((count/appidList.length)*100);

            let game;
            let isDuplicate = false;

            try {

                if (result.some( res => res.appid == appid.appid) && option.merge) {
                  isDuplicate = true;
                  game = result.find( elem => elem.appid == appid.appid);
                }
                else if (appid.data.type === "rpcs3"){
                  game = await rpcs3.getGameData(appid.data.path);
                }else{
                  game = await loadSteamData({appID: appid.appid, lang: option.lang, key: option.key });      
                }

                let root;
                
                if (appid.data.type === "file") {
                
                    let local;
                    
                    let ACH_File = ["achievements.ini","stats/achievements.ini","Achievements.Bin" ,"achieve.dat"];
                    
                    for (let file of ACH_File) {
                      try {
                        local = ini.parse(await ffs.promises.readFile(path.join(appid.data.path,file),"utf8"));
                        break;
                      } catch (e) {}
                    }
                
                    if(!local) throw "No achievement file found"; 

                    const filter = ["SteamAchievements","Steam64","Steam"];
                    
                    root = omit(local.ACHIEVE_DATA || local, filter);

                 } else if (appid.data.type === "reg") {
                       
                    root = regedit.RegListAllValues(appid.data.root,appid.data.path); 
                    if (!root) throw "No achievement found in registry"; 

                 } else if (appid.data.type === "steamAPI") {
                 
                   let users = appid.data.userID;
                   for (let user of users)  {
                      try {
                       root = await loadSteamUserStats({appID: appid.appid, user: user, path: appid.data.cachePath , key: option.key });
                       break;
                      }catch(e){
                        debug.log(e);
                        debug.log(`trying with next public user if any for ${appid.appid}`);
                      }
                   }

                 } else if (appid.data.type === "rpcs3"){
                  
                   root = await rpcs3.getAchievements(appid.data.path,game.achievement.total);
                 }

                 for (let i in root){

                     try {
                     
                          let achievement;
                          let parsed;
                          
                          if (appid.data.type === "file") { 
                          
                                achievement = game.achievement.list.find( elem => elem.name === i);
      
                                if(root[i].State) { //RLD!
                                  root[i].State = new Uint32Array(Buffer.from(root[i].State.toString(),"hex"))[0]; //uint32 -> int
                                  root[i].CurProgress = parseInt(root[i].CurProgress.toString(),16);
                                  root[i].MaxProgress = parseInt(root[i].CurProgress.toString(),16); 
                                }
                                                       
                                parsed = {
                                  Achieved : (root[i].Achieved == 1 || root[i].State == 1 || root[i].HaveAchieved == 1 || root[i] == 1 ) ? true : false,
                                  CurProgress : root[i].CurProgress || 0,
                                  MaxProgress : root[i].MaxProgress || 0,
                                  UnlockTime : root[i].UnlockTime || root[i].HaveAchievedTime || 0
                                };
                              
                          } else if (appid.data.type === "reg") {

                               achievement = game.achievement.list.find( elem => elem.name === root[i]);
                               
                               parsed = {
                                     Achieved : (parseInt(regedit.RegQueryIntegerValue(appid.data.root,appid.data.path,root[i])) == 1 ) ? true : false,
                                     CurProgress : 0,
                                     MaxProgress : 0,
                                     UnlockTime :  0
                               };

                          } else if (appid.data.type === "steamAPI") {

                               achievement = game.achievement.list.find( elem => elem.name === root[i].apiname);
                               
                               parsed = {
                                     Achieved : (root[i].achieved == 1) ? true : false,
                                     CurProgress : 0,
                                     MaxProgress : 0,
                                     UnlockTime :  root[i].unlocktime
                               };

                          } else if (appid.data.type === "rpcs3") {
                               achievement = game.achievement.list.find(elem => elem.name == root[i].id);
                               
                               parsed = {
                                  Achieved : root[i].hasAchieved,
                                  UnlockTime: (root[i].timestamp == "ffffffff") ? 0 : parseInt(root[i].timestamp,16)
                               };
                          }
                         
                          if (isDuplicate) {
                                if (parsed.Achieved && !achievement.Achieved) {    
                                  achievement.Achieved = true;
                                }
                                
                                if (parsed.CurProgress > achievement.CurProgress || !achievement.CurProgress) {
                                  achievement.CurProgress = parsed.CurProgress;
                                }
                                
                               if (parsed.MaxProgress > achievement.MaxProgress || !achievement.MaxProgress) {
                                  achievement.MaxProgress = parsed.MaxProgress;
                                }
                                
                                if (parsed.UnlockTime > achievement.UnlockTime || !achievement.UnlockTime) {
                                  achievement.UnlockTime = parsed.UnlockTime;
                                }
                                
                           } else {
                                Object.assign(achievement,parsed);
                           }
     
                       }catch(e){
                            debug.log(`[${appid.appid}] Achievement not found in game schema data ?! ... Achievement was probably deleted or renamed over time`);
                       }          
                    }

                   game.achievement.unlocked = game.achievement.list.filter(x => x.Achieved == 1).length;
                   if (!isDuplicate) {
                     result.push(game);
                   }
                 

            //loop appid
            } catch(err) {
              debug.log(`[${appid.appid}] Error parsing local achievements data > SKIPPING`);
              debug.log(err);
            }
            
        callbackProgress(percent);
        count = count + 1;
        }

        return result;

    } else {
      return null;
    }
      
  }catch(err) {
    debug.log(err);
  }
};


async function discover(legitSteamListingType) {
  try{
    
    let search = [
        path.join(process.env['Public'],"Documents/Steam/CODEX")+"/([0-9]+)/", 
        path.join(process.env['APPDATA'],"Steam/CODEX")+"/([0-9]+)/",
        path.join(process.env['PROGRAMDATA'],"Steam")+"/*/([0-9]+)/",
        path.join(process.env['LOCALAPPDATA'],"SKIDROW")+"/([0-9]+)/",
        path.join(process.env['APPDATA'],"CPY_SAVES")+"/*/([0-9]+)/",
        path.join(regedit.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","Personal"),"CPY_SAVES")+"/*/([0-9]+)/",
        path.join(process.env['APPDATA'],"SmartSteamEmu")+"/([0-9]+)/",
        path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves")+"/([0-9]+)/"
    ];
    
    let ALI213 = [];
    let ps3 = [];
    
    try{
    
      for (let dir of await getUserCustomDir()) {
        
        //rpcs3
        try{
          
          if (await ffs.promises.exists(path.join(dir.path,"rpcs3.exe"))) {

            ps3 = ps3.concat(await rpcs3.scan(dir.path));

          } else {
            try {
              let info = ini.parse(await ffs.promises.readFile(path.join(dir.path,"ALI213.ini"),"utf8"));
              ALI213.push({ appid: info.Settings.AppID,
                          data: {
                                type: "file",
                                path: path.join(dir.path,`Profile/${info.Settings.PlayerName}/Stats/`)
                          }
              });
            }catch(e){
              search.push(dir.path+"/([0-9]+)/");
            }
          }
        }catch(e){
          debug.log(e);
        }
        
      }
    
    }catch(err){
      debug.log(err);
    }
    
    let data = (await glob(search,{onlyDirectories: true, absolute: true})).map((dir) => {
    
                  return { appid: path.parse(dir).name, 
                           data: {
                            type: "file",
                            path: dir
                           }
                          }
               });
     
    if (ALI213.length > 0) {
      debug.log("Adding ALI213 from user custom dir");
      data = data.concat(ALI213);
    }   
    
    if (ps3.length > 0) {
      debug.log("Adding ps3 from user custom dir");
      data = data.concat(ps3);
    }            
               
    //GreenLuma Reborn
    let glr = regedit.RegListAllSubkeys("HKCU","SOFTWARE/GLR/AppID");
    if (glr) {
      for (let key of glr) {
          
          try {
             let glr_ach_enable = parseInt(regedit.RegQueryIntegerValue ("HKCU",`SOFTWARE/GLR/AppID/${key}`,"SkipStatsAndAchievements"));

             if(glr_ach_enable === 0) {

               data.push({appid: key,
                           data: {
                              type: "reg",
                              root: "HKCU",
                              path: `SOFTWARE/GLR/AppID/${key}/Achievements`}
                        });
              } else {
                debug.log(`[${key}] SkipStatsAndAchievements is no set to 0 in registry > SKIPPING`);
              }
           }catch(e){
              debug.log(e);
           }
      }
    } else {
      debug.log("GLR No achievement found in registry");
    }
    
    //Legit Steam
    
    if (regedit.RegKeyExists("HKCU","Software/Valve/Steam") && legitSteamListingType != 0){ 
      try{
        const steamPath = regedit.RegQueryStringValue("HKCU","Software/Valve/Steam","SteamPath");
        if (!steamPath) throw "SteamPath not found";
        
         let userID = await getSteamUsers(steamPath);

         let steamCache = path.join(steamPath,"appcache/stats");
         let steamAppIDList = (await glob("UserGameStatsSchema_*([0-9]).bin",{cwd: steamCache, onlyFiles: true, absolute: false})).map(filename => filename.match(/([0-9]+)/g)[0]);
               
         for (let appid of steamAppIDList) {
          
             let hasStatsSchema = await ffs.promises.exists(path.join(steamCache,`UserGameStatsSchema_${appid}.bin`));

             let isInstalled = true;
             if (legitSteamListingType == 1) {
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

        }catch(e){
          debug.log(e);
        }
    } else {
      debug.log("Legit Steam not found or disabled.");
    }

    //AppID Blacklisting
    try{  
    
        let exclude = [
          480, //Space War
          753, //Steam Config
          250820, //SteamVR
          228980 //Steamworks Common Redistributables
        ];
        
        try{
          let srvExclusion = (await request.getJson("https://api.xan105.com/steam/getBogusList")).data;
          debug.log("blacklist from srv:");
          debug.log(srvExclusion);
          exclude = [...new Set([...exclude,...srvExclusion])];
        }catch(e){
          //Do nothing
        }
        
        try{
          let userExclusion = JSON.parse(await ffs.promises.readFile(exclusion,"utf8")); 
          exclude = [...new Set([...exclude,...userExclusion])];
        }catch(e){
          //Do nothing
        }
        data = data.filter(appid => { return !exclude.some((id) => id == appid.appid) }); 
        
    }catch(e){
        debug.log(e);
    }

    return data;

  }catch(e){
    debug.log(e);
  }

}

const getUserCustomDir = module.exports.getUserCustomDir = async () => {

    try{
        return JSON.parse(await ffs.promises.readFile(userdir,"utf8"));   
    }catch(e){
        throw e;
    }
    
}

module.exports.resetBlackList = async() => {
  try{
    await ffs.promises.writeFile(exclusion,JSON.stringify([], null, 2),"utf8"); 
  }catch(e){
    throw e;
  }
}

module.exports.parserBlacklist = async (appid) => {
    try{
        
        debug.log(`Blacklisting ${appid} ...`);
        
        let userExclusion;
        
        try{
          userExclusion = JSON.parse(await ffs.promises.readFile(exclusion,"utf8"));
        }catch(e){
          userExclusion = [];
        } 
        
        if (!userExclusion.includes(appid)) {
          userExclusion.push(appid);
          await ffs.promises.writeFile(exclusion,JSON.stringify(userExclusion, null, 2),"utf8"); 
          debug.log("Done.");
        } else {
          debug.log("Already blacklisted.");
        }
  
    }catch(e){
        throw e;
    }
}

module.exports.saveUserCustomDir = async (data) => {

    try{
        await ffs.promises.writeFile(userdir,JSON.stringify(data, null, 2),"utf8");    
    }catch(e){
        throw e;
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

async function loadSteamUserStats(cfg) {

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
  debug.log(err);
  throw "Could not load Steam User Stats."
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

async function loadSteamData(cfg) {

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
  debug.log(err);
  throw "Could not load Steam data."
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
            name: appdetail.name,
            appid: cfg.appID,
            binary: path.parse(steamdb.binary).base,
            img: {
              header: appdetail.header_image.split("?")[0],
              background: appdetail.background.split("?")[0],
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
    throw err;
  }
}