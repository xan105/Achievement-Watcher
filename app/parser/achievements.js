"use strict";

const { remote } = require('electron');
const path = require("path");
const ffs = require(path.join(appPath,"util/feverFS.js"));
const steam = require(path.join(appPath,"parser/steam.js"));
const rpcs3 = require(path.join(appPath,"parser/rpcs3.js"));
const glr = require(path.join(appPath,"parser/glr.js"));
const userDir = require(path.join(appPath,"parser/userDir.js"));
const blacklist = require(path.join(appPath,"parser/blacklist.js"));
const debug = new (require(path.join(appPath,"util/log.js")))({
  console: remote.getCurrentWindow().isDev || false,
  file: path.join(remote.app.getPath('userData'),"logs/parser.log")
});

async function discover(legitSteamListingType) {
  try{
    
    let data = [];
    
    //UserCustomDir
    let temp = [[],[],[]];
    try{
    
      for (let dir of await userDir.get()) {
        try{//rpcs3

          if (await ffs.promises.exists(path.join(dir.path,"rpcs3.exe"))) {
            temp[0] = temp[0].concat(await rpcs3.scan(dir.path));
          } else {
            try { //ALI213
              let info = ini.parse(await ffs.promises.readFile(path.join(dir.path,"ALI213.ini"),"utf8"));
              temp[1].push({ appid: info.Settings.AppID,
                          data: {
                                type: "file",
                                path: path.join(dir.path,`Profile/${info.Settings.PlayerName}/Stats/`)
                          }
              });
            }catch(e){//
              temp[2].push(dir.path);
            }
          }
        }catch(e){
          debug.log(e);
        }
      }
      if (temp[0].length > 0) {
        debug.log("Adding ps3 from user custom dir");
        data = data.concat(temp[0]);
      }  
      if (temp[1].length > 0) {
        debug.log("Adding ALI213 from user custom dir");
        data = data.concat(temp[1]);
      }   
    
    }catch(err){
      debug.log(err);
    }
    
   ///Non-Legit Steam
    try {
      data = data.concat(await steam.scan(temp[2]));
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
  
      let appidList = await discover(option.steam);

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
                }else{
                  game = await steam.getGameData({appID: appid.appid, lang: option.lang, key: option.key });      
                }

                let root;
                
                if (appid.data.type === "file") {
 
                    root = await steam.getAchievementsFromFile(appid.data.path);

                 } else if (appid.data.type === "reg") {
                       
                    root = await glr.getAchievements(appid.data.root,appid.data.path);

                 } else if (appid.data.type === "steamAPI") {
                 
                   for (let user of appid.data.userID)  {
                      try {
                       root = await steam.getAchievementsFromAPI({appID: appid.appid, user: user, path: appid.data.cachePath , key: option.key });
                       break;
                      }catch(e){
                        debug.log(`trying with next public user if any for ${appid.appid}`);
                      }
                   }

                 } else if (appid.data.type === "rpcs3"){
                  
                   root = await rpcs3.getAchievements(appid.data.path,game.achievement.total);
                 }

                 for (let i in root){

                     try {

                          let id = root[i].id || root[i].apiname || i;
                          
                          let achievement = game.achievement.list.find( elem => elem.name == id);
                          if(!achievement) throw "ACH_NOT_FOUND_IN_SCHEMA";
                          
                          if(root[i].State) { //RLD!
                                root[i].State = new Uint32Array(Buffer.from(root[i].State.toString(),"hex"))[0]; //uint32 -> int
                                root[i].CurProgress = parseInt(root[i].CurProgress.toString(),16);
                                root[i].MaxProgress = parseInt(root[i].CurProgress.toString(),16); 
                          }
                                                       
                          let parsed = {
                                Achieved : (root[i].Achieved == 1 || root[i].achieved == 1 || root[i].State == 1 || root[i].HaveAchieved == 1 || root[i] == 1 ) ? true : false,
                                CurProgress : root[i].CurProgress || 0,
                                MaxProgress : root[i].MaxProgress || 0,
                                UnlockTime : root[i].UnlockTime || root[i].unlocktime || root[i].HaveAchievedTime || 0
                          };

                          if (isDuplicate) {
                              if (parsed.Achieved && !achievement.Achieved) {    
                                    achievement.Achieved = true;
                              }
                                    
                              if (!achievement.CurProgress || parsed.CurProgress > achievement.CurProgress) {
                                    achievement.CurProgress = parsed.CurProgress;
                              }
                                    
                              if (!achievement.MaxProgress || parsed.MaxProgress > achievement.MaxProgress) {
                                    achievement.MaxProgress = parsed.MaxProgress;
                              }
                                    
                              if (!achievement.UnlockTime || parsed.UnlockTime > achievement.UnlockTime) {
                                    achievement.UnlockTime = parsed.UnlockTime;
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