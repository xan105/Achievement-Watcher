"use strict";

const { remote } = require('electron');
const path = require("path");
const ffs = require(path.join(appPath,"util/feverFS.js"));
const steam = require(path.join(appPath,"parser/steam.js"));
const uplay = require(path.join(appPath,"parser/uplay.js"));
const rpcs3 = require(path.join(appPath,"parser/rpcs3.js"));
const glr = require(path.join(appPath,"parser/glr.js"));
const userDir = require(path.join(appPath,"parser/userDir.js"));
const blacklist = require(path.join(appPath,"parser/blacklist.js"));
const watchdog = require(path.join(appPath,"parser/watchdog.js"));
const debug = new (require(path.join(appPath,"util/log.js")))({
  console: remote.getCurrentWindow().isDev || false,
  file: path.join(remote.app.getPath('userData'),"logs/parser.log")
});

async function discover(legitSteamListingType,importCache) {
  try{
    
    let data = [];
    
    //UserCustomDir
    let additionalSearch = [];
    try{
      for (let dir of await userDir.get()) {

          debug.log(`[userdir] ${dir.path}`);

          let scanned = await rpcs3.scan(dir.path);
          if (scanned.length > 0) {
              data = data.concat(scanned);
              debug.log("-> RPCS3 data added");
          } else {
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
    try {
      data = data.concat(await steam.scan(additionalSearch));
    }catch(err){
      debug.log(err);
    } 
    //GreenLuma Reborn
    try {
      data = data.concat(await glr.scan());
    }catch(err){
      debug.log(err);
    }
    //Legit Steam
    try {
      data = data.concat(await steam.scanLegit(legitSteamListingType));
    }catch(err){
      debug.log(err);
    }
    
    //Lumaplay
    try{
      data = data.concat(await uplay.scan());
    }catch(err){
      debug.log(err);
    }
    
    //Uplay
    try{
      data = data.concat(await uplay.scanLegit());
    }catch(err){
      debug.log(err);
    }
    
    if(importCache){
      try{
        data = data.concat(await watchdog.scan());
      }catch(err){
        debug.log(err);
      }
    }
    
    //AppID Blacklisting
    try{  
        let exclude = await blacklist.get();
        data = data.filter(appid => { return !exclude.some((id) => id == appid.appid) });   
    }catch(err){
        debug.log(err);
    }

    return data;

  }catch(err){
    debug.log(err);
  }

}

module.exports.makeList = async(option, callbackProgress = ()=>{}) => {

  try {

      let result = [];
  
      let appidList = await discover(option.steam,option.importCache);

      if ( appidList.length > 0) {
        let count = 1;

        for (let appid of appidList) {

            let percent = Math.floor((count/appidList.length)*100);

            let game;
            let isDuplicate = false;

            try {

                if (result.some( res => res.appid == appid.appid) && option.merge) {
                  game = result.find( elem => elem.appid == appid.appid);
                  isDuplicate = true;
                }
                else if (appid.data.type === "rpcs3"){
                  game = await rpcs3.getGameData(appid.data.path);
                }else if (appid.data.type === "uplay" || appid.data.type === "lumaplay"){
                  game = await uplay.getGameData(appid.appid,option.lang);
                }else{
                  game = await steam.getGameData({appID: appid.appid, lang: option.lang, key: option.key });      
                }

                if(!option.merge && appid.source) game.source = appid.source;

                let root;
                
                if (appid.data.type === "file") {
 
                    root = await steam.getAchievementsFromFile(appid.data.path);

                 } else if (appid.data.type === "reg") {
                       
                    root = glr.getAchievements(appid.data.root,appid.data.path);

                 } else if (appid.data.type === "steamAPI") {
                 
                   for (let user of appid.data.userID)  {
                      try {
                       root = await steam.getAchievementsFromAPI({appID: appid.appid, user: user, path: appid.data.cachePath , key: option.key });
                       break;
                      }catch(e){
                        debug.log(`${e} => Trying with next public user if any for ${appid.appid}`);
                      }
                   }

                 } else if (appid.data.type === "rpcs3"){
                  
                   root = await rpcs3.getAchievements(appid.data.path,game.achievement.total);
                   
                 } else if (appid.data.type === "lumaplay"){
                  
                   root = uplay.getAchievementsFromLumaPlay(appid.data.root,appid.data.path);
                   
                 } else if (appid.data.type === "cached"){
                   root = await watchdog.getAchievements(appid.appid);
                 }

                 for (let i in root){

                     try {

                          let id = root[i].id || root[i].apiname || root[i].name || i;
                          
                          let achievement = game.achievement.list.find( elem => elem.name == id);
                          if(!achievement) throw "ACH_NOT_FOUND_IN_SCHEMA";
                        
                          let parsed = {
                                Achieved : (root[i].Achieved == 1 || root[i].achieved == 1 || root[i].State == 1 || root[i].HaveAchieved == 1 || root[i].Unlocked == 1 || root[i] == 1) ? true : false,
                                CurProgress : root[i].CurProgress || 0,
                                MaxProgress : root[i].MaxProgress || 0,
                                UnlockTime : root[i].UnlockTime || root[i].unlocktime || root[i].HaveAchievedTime || root[i].Time || 0
                          };
                          
                          if (!parsed.Achieved && parsed.MaxProgress == 100 && parsed.CurProgress == 100) { //CODEX 09/2019 (Gears5)
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
                                    
                              if (option.recent) {
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
                            debug.log(`[${appid.appid}] Achievement not found in game schema data ?! ... Achievement was probably deleted or renamed over time`);
                           }else {
                            debug.log(`Unexpected Error: ${err}`);
                           }
                       }          
                    }

                   game.achievement.unlocked = game.achievement.list.filter(ach => ach.Achieved == 1).length;
                   if (!isDuplicate) result.push(game);

            //loop appid
            } catch(err) {
              debug.log(`[${appid.appid}] Error parsing local achievements data => ${err} > SKIPPING`);
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