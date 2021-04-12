"use strict";

const remote = require('@electron/remote');
const path = require("path");
const steam = require(path.join(appPath,"parser/steam.js"));
const uplay = require(path.join(appPath,"parser/uplay.js"));
const rpcs3 = require(path.join(appPath,"parser/rpcs3.js"));
const greenluma = require(path.join(appPath,"parser/greenluma.js"));
const userDir = require(path.join(appPath,"parser/userDir.js"));
const blacklist = require(path.join(appPath,"parser/blacklist.js"));
const watchdog = require(path.join(appPath,"parser/watchdog.js"));
const debug = new (require("@xan105/log"))({
  console: remote.getCurrentWindow().isDev || false,
  file: path.join(remote.app.getPath('userData'),"logs/parser.log")
});
const { crc32 } = require('crc');

async function discover(source) {

    debug.log("Scanning for games ...");
    
    let data = [];
    
    //UserCustomDir
    let additionalSearch = [];
    try{
      for (let dir of await userDir.get()) {

          debug.log(`[userdir] ${dir.path}`);
          
          let scanned = [];
          if (source.rpcs3) scanned = await rpcs3.scan(dir.path);
          if (scanned.length > 0) {
              data = data.concat(scanned);
              debug.log("-> RPCS3 data added");
          } else if(source.steamEmu) {
              scanned = await userDir.scan(dir.path);
              if (scanned.length > 0) {
                  data = data.concat(scanned);
                  debug.log("-> Steam emu data added");
              } else {
                  additionalSearch.push(dir.path);
                  debug.log("-> will be scanned for appid folder(s)"); 
              }
          }
          
      }
    }catch(err){
      debug.log(err);
    }
    
   //Non-Legit Steam
   if (source.steamEmu){
      try {
        data = data.concat(await steam.scan(additionalSearch));
      }catch(err){
        debug.error(err);
      } 
    }
    
    //GreenLuma
    if (source.greenLuma){
      try {
        data = data.concat(await greenluma.scan());
      }catch(err){
        debug.error(err);
      }
    }
    
    //Legit Steam
    if (source.legitSteam > 0) {
      try {
        data = data.concat(await steam.scanLegit(source.legitSteam));
      }catch(err){
        debug.error(err);
      }
    }
    
    if (source.lumaPlay){
      //Lumaplay
      try{
        data = data.concat(await uplay.scan());
      }catch(err){
        debug.error(err);
      }
      
      //Uplay
      try{
        data = data.concat(await uplay.scanLegit());
      }catch(err){
        debug.error(err);
      }
    }
    
    if(source.importCache){
      try{
        data = data.concat(await watchdog.scan());
      }catch(err){
        debug.error(err);
      }
    }
    
    //AppID Blacklisting
    try{  
        let exclude = await blacklist.get();
        data = data.filter(appid => { return !exclude.some((id) => id == appid.appid) });   
    }catch(err){
        debug.error(err);
    }

    return data;

}

module.exports.makeList = async(option, callbackProgress = ()=>{}) => {

  try {
      
      let result = [];
  
      let appidList = await discover(option.achievement_source);

      if ( appidList.length > 0) {
        let count = 1;

        for (let appid of appidList) 
        {

            let percent = Math.floor((count/appidList.length)*100);

            let game;
            let isDuplicate = false;

            try {

                if (result.some( res => res.appid == appid.appid) && option.achievement.mergeDuplicate) {
                  game = result.find( elem => elem.appid == appid.appid);
                  isDuplicate = true;
                }
                else if (appid.data.type === "rpcs3"){
                  game = await rpcs3.getGameData(appid.data.path);
                }else if (appid.data.type === "uplay" || appid.data.type === "lumaplay"){
                  game = await uplay.getGameData(appid.appid,option.achievement.lang);
                }else{
                  game = await steam.getGameData({appID: appid.appid, lang: option.achievement.lang, key: option.steam.apiKey });    
                }

                if(!option.achievement.mergeDuplicate && appid.source) game.source = appid.source;

                let root = {};
                try {
                  if (appid.data.type === "file") {
                  
                      root = await steam.getAchievementsFromFile(appid.data.path);
                      //Note to self: Empty file should be considered as a 0% game -> do not throw an error just issue a warning
                      if(root.constructor === Object && Object.entries(root).length === 0) debug.warn(`[${appid.appid}] Warning ! Achievement file in '${appid.data.path}' is probably empty`);

                   } else if (appid.data.type === "reg") {
                         
                      root = await greenluma.getAchievements(appid.data.root,appid.data.path);

                   } else if (appid.data.type === "steamAPI") {
                   
                     root = await steam.getAchievementsFromAPI({appID: appid.appid, user: appid.data.userID, path: appid.data.cachePath , key: option.steam.apiKey });

                   } else if (appid.data.type === "rpcs3"){
                    
                     root = await rpcs3.getAchievements(appid.data.path,game.achievement.total);
                     
                   } else if (appid.data.type === "lumaplay"){
                    
                     root = uplay.getAchievementsFromLumaPlay(appid.data.root,appid.data.path);
                     
                   } else if (appid.data.type === "cached"){
                   
                     root = await watchdog.getAchievements(appid.appid);
                     
                   } else {
                   
                     throw "Not yet implemented";
                    
                   }
                 }catch(err){
                    debug.error(`[${appid.appid}] Error parsing local achievements data => ${err}`);
                 }
                
                 for (let i in root)
                 {

                     try {

                          let achievement = game.achievement.list.find( (elem) => { 
                              if (root[i].crc) {
                                return root[i].crc.includes(crc32(elem.name).toString(16)); //(SSE) crc module removes leading 0 when dealing with anything below 0x1000 -.-'
                              } else {
                                let apiname = root[i].id || root[i].apiname || root[i].name || i;
                                return elem.name == apiname || elem.name.toString().toUpperCase() == apiname.toString().toUpperCase() //uppercase == uppercase : cdx xcom chimera (apiname doesn't match case with steam schema)
                              }
                          });
                          if(!achievement) throw "ACH_NOT_FOUND_IN_SCHEMA";
                        
                          let parsed = {
                                Achieved : (root[i].Achieved == 1 || root[i].achieved == 1 || root[i].State == 1 || root[i].HaveAchieved == 1 || root[i].Unlocked == 1 || root[i].earned || root[i] == 1) ? true : false,
                                CurProgress : root[i].CurProgress || root[i].progress || 0,
                                MaxProgress : root[i].MaxProgress || root[i].max_progress || 0,
                                UnlockTime : root[i].UnlockTime || root[i].unlocktime || root[i].HaveAchievedTime || root[i].HaveHaveAchievedTime || root[i].Time || root[i].earned_time || 0
                          };
                          
                          if (!parsed.Achieved && parsed.MaxProgress != 0 && parsed.CurProgress != 0 && parsed.MaxProgress == parsed.CurProgress) { //CODEX Gears5 (09/2019)  && Gears tactics (05/2020)
                            parsed.Achieved = true;
                          }

                          if (isDuplicate) {
                              if (parsed.Achieved && !achievement.Achieved) {    
                                    achievement.Achieved = true;
                              }
                                    
                              if ((!achievement.CurProgress && parsed.CurProgress > 0) || (parsed.CurProgress > 0 && parsed.MaxProgress == achievement.MaxProgress && parsed.CurProgress > achievement.CurProgress)) {
                                    achievement.CurProgress = parsed.CurProgress;
                              }
                                    
                              if (!achievement.MaxProgress && parsed.MaxProgress > 0) {
                                    achievement.MaxProgress = parsed.MaxProgress;
                              }
                                    
                              if (option.achievement.timeMergeRecentFirst) {
                                if( (!achievement.UnlockTime || achievement.UnlockTime == 0) || parsed.UnlockTime > achievement.UnlockTime ){ //More recent first
                                      achievement.UnlockTime = parsed.UnlockTime;
                                }
                              } else {
                                if( (!achievement.UnlockTime || achievement.UnlockTime == 0) || (parsed.UnlockTime > 0 && parsed.UnlockTime < achievement.UnlockTime) ){ //Oldest first
                                      achievement.UnlockTime = parsed.UnlockTime;
                                }
                              }
                          } else {
                              Object.assign(achievement,parsed);
                          }
     
                       }catch(err){
                          if(err === "ACH_NOT_FOUND_IN_SCHEMA") {
                            debug.warn(`[${appid.appid}] Achievement not found in game schema data ?! ... Achievement was probably deleted or renamed over time`);
                          } else {
                            debug.error(`[${appid.appid}] Unexpected Error: ${err}`);
                          }
                       }          
                 }

                 game.achievement.unlocked = game.achievement.list.filter(ach => ach.Achieved == 1).length;
                 if (!isDuplicate) result.push(game);

            //loop appid
            } catch(err) {
              debug.error(`[${appid.appid}] Error parsing local achievements data => ${err} > SKIPPING`);
            }
            
        callbackProgress(percent);
        count = count + 1;
        }

    }
    
    return result;
      
  }catch(err) {
    debug.error(err);
    throw err;
  }
};