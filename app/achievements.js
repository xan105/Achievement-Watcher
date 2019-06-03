"use strict";

const { remote } = require('electron');
const path = require("path");
const util = require("util");
const glob = require("fast-glob");
const ini = require("ini");
const request = require(require.resolve("./util/request.js"));
const ffs = require(require.resolve("./util/feverFS.js"));
const htmlParser = require('node-html-parser').parse;
const regedit = require(path.join(remote.app.getAppPath(),"native/regedit/regedit.js"));

const steamLanguages = require("./locale/steam.json");
const userdir = path.join(remote.app.getPath('userData'),"cfg/userdir.db");

module.exports.makeList = async(option, callbackProgress = ()=>{}) => {

  try {

      let result = [];
  
      let appidList = await discover();
      
      console.log(appidList);

      if ( appidList.length > 0) {
        let count = 1;

        for (let appid of appidList) {

            let percent = Math.floor((count/appidList.length)*100);

            let game;
            let isDuplicate = false;

            try {
            
                let ACH_File = ["achievements.ini","stats/achievements.ini","achieve.dat"];
                
                let local;
                for (let file of ACH_File) {
                  try {
                    local = ini.parse(await ffs.promises.readFile(path.join(appid.path,file),"utf8"));
                    break;
                  } catch (e) {}
                }
            
                if(!local) { 
                  throw "No achievement file found";
                } 
                else if (result.some( res => res.appid == appid.appid) && option.merge) {
                  isDuplicate = true;
                  game = result.find( elem => elem.appid == appid.appid);
                }
                else {
                  game = await loadSteamData({appID: appid.appid, lang: option.lang, key: option.key });      
                }
                
                let root = local.ACHIEVE_DATA || local;

                for (let i in root){

                    if (i !== "SteamAchievements" && i !== "Steam64" && i !== "Steam") {
                      try {
                        let achievement = game.achievement.list.find( elem => elem.name === i);
                        
                        if(root[i].State) { 
                          root[i].State = new Uint32Array(Buffer.from(root[i].State.toString(),"hex"))[0]; //uint32 -> int
                          root[i].CurProgress = parseInt(root[i].CurProgress.toString(),16);
                          root[i].MaxProgress = parseInt(root[i].CurProgress.toString(),16);
                        }
                        
                        let result = {
                          Achieved : (root[i].Achieved == 1 || root[i].State == 1 || root[i] == 1 ) ? true : false,
                          CurProgress : root[i].CurProgress || 0,
                          MaxProgress : root[i].MaxProgress || 0,
                          UnlockTime : root[i].UnlockTime || 0
                        };

                        if (isDuplicate) {
                          if (result.Achieved && !achievement.Achieved) {    
                            achievement.Achieved = true;
                          }
                          
                          if (result.CurProgress > achievement.CurProgress || !achievement.CurProgress) {
                            achievement.CurProgress = result.CurProgress;
                          }
                          
                         if (result.MaxProgress > achievement.MaxProgress || !achievement.MaxProgress) {
                            achievement.MaxProgress = result.MaxProgress;
                          }
                          
                          if (result.UnlockTime > achievement.UnlockTime || !achievement.UnlockTime) {
                            achievement.UnlockTime = result.UnlockTime;
                          }
                          
                        } else {
                          Object.assign(achievement,result);
                        }
 
                      }catch(e){
                        //Achievement not found in steam data ?! ... Achievement was probably deleted or renamed over time
                      }
                    }
                  }                

                game.achievement.unlocked = game.achievement.list.filter(x => x.Achieved == 1).length;
                if (!isDuplicate) {
                  result.push(game);
                }
            
            } catch(err) {
              //error parsing local achievements.ini > SKIPPING
            }
            
        callbackProgress(percent);
        count = count + 1;
        }

        return result;

    } else {
      return null;
    }
      
  }catch(err) {
    //Do nothing
  }
};


async function discover() {
  try{
  
    let search = [
        path.join(process.env['Public'],"Documents/Steam/CODEX")+"/*([0-9])/", 
        path.join(process.env['APPDATA'],"Steam/CODEX")+"/*([0-9])/",
        path.join(process.env['PROGRAMDATA'],"Steam")+"/*/*([0-9])/",
        path.join(process.env['LOCALAPPDATA'],"SKIDROW")+"/*([0-9])/",
        path.join(process.env['APPDATA'],"CPY_SAVES")+"/*/*([0-9])/",
        path.join(regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","Personal"),"CPY_SAVES")+"/*/*([0-9])/",
        path.join(process.env['APPDATA'],"SmartSteamEmu")+"/*([0-9])/",
        path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves")+"/*([0-9])/"
    ];
    
    try{
    
      for (let dir of await getUserCustomDir()) {
           search.push(dir.path+"/*([0-9])/");
      }
    
    }catch(err){
      //error no file or json parse -> do nothing
      console.error(err);
    }

    console.log(search);
    
    let data = (await glob(search,{onlyDirectories: true, absolute: true})).map((dir) => {
    
                  return { appid: path.parse(dir).name, 
                            path: dir }
               });

    return data;

  }catch(e){
    console.log(e);
  }

}

const getUserCustomDir = module.exports.getUserCustomDir = async () => {

    try{
        return JSON.parse(await ffs.promises.readFile(userdir,"utf8"));   
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

async function loadSteamData(cfg) {

  if (!steamLanguages.some( language => language.api === cfg.lang )) {
        throw "Unsupported API language code";
  }

  const cache = path.join(remote.app.getPath('userData'),"steam_cache",cfg.lang);

  try {
  
    let filePath = path.join(`${cache}`,`${cfg.appID}.json`);
    
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