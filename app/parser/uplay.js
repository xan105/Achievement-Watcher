"use strict";

const { remote } = require('electron');
const path = require('path');
const yaml = require('js-yaml');
const glob = require("fast-glob");
const zip = require('adm-zip');
const ffs = require('@xan105/fs');
const regedit = require('regodit');
const request = require('request-zero');
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

const debug = new (require("@xan105/log"))({
  console: remote.getCurrentWindow().isDev || false,
  file: path.join(remote.app.getPath('userData'),"logs/uplay.log")
});

module.exports.scan = () => { //LumaPlay
  try{

    let users = regedit.RegListAllSubkeys("HKCU","SOFTWARE/LumaPlay");
    if (!users) throw "LumaPlay no user found";
    
    let data = [];
    
    for (let user of users) {
      try {
        let appidList = regedit.RegListAllSubkeys("HKCU",`SOFTWARE/LumaPlay/${user}`);
        if (!appidList) throw `No achievements found for LumaPlay user: ${user}`;
        
        for (let appid of appidList) {
        
          data.push({appid: `UPLAY${appid}`,
                     source: "Lumaplay",
                     data: {
                        type: "lumaplay",
                        root: "HKCU",
                        path: `SOFTWARE/LumaPlay/${user}/${appid}/Achievements`}
          });
        
        }
      }catch(err){
        debug.log(err);
      }
    }

    return data;
    
  }catch(err){
    throw err;
  }
}

module.exports.scanLegit = async ( onlyInstalled = false) => { //Uplay /*Unused function; As of writing there is no way to get legit user ach unlocked data*/
  try{
    const uplayPath = regedit.RegQueryStringValue("HKLM","Software/WOW6432Node/Ubisoft/Launcher","InstallDir");
    if (!uplayPath) throw "Uplay Path not found";
    
    let data = [];
    
    if (onlyInstalled) {
    
        let installedList = regedit.RegListAllSubkeys("HKLM","SOFTWARE/WOW6432Node/Ubisoft/Launcher/Installs");
        if (!installedList) throw "Uplay has no game installed";
        
        for (let appid of installedList) {
                data.push({appid: `UPLAY${appid}`,
                           source: "uPlay",
                           data: {
                              type: "uplay"}
                });
        }
        
    } else {
    
        const ach_cache = path.join(uplayPath,"cache/achievements");
        let list = (await glob("([0-9]+)_*",{cwd: ach_cache, onlyFiles: true, absolute: false})).map((filename) => {
  
            let col = filename.split("_");
          
            return {
              appid: col[0],
              index: col[1].replace(".zip","")
            }
          
          });

        for (let game of list) {
                data.push({appid: `UPLAY${game.appid}`,
                           source: "uPlay",
                           data: {
                              type: "uplay"}
                });
        }
        
    }
    
    return data;
  }catch(err){
    throw err;
  }  
}

module.exports.getGameData = async (appid,lang) => {
  try {
     
     appid = appid.replace("UPLAY","");
     
     const cacheFile = path.join(remote.app.getPath('userData'),"uplay_cache/schema",`${appid}.db`); 
     
     let schema;
     
     if (await ffs.existsAndIsYoungerThan(cacheFile,{timeUnit: 'M', time: 1})) {
        schema = JSON.parse(await ffs.readFile(cacheFile));
     } else {
        try {
          schema = await getUplayDataFromSRV(appid);
        }catch(err){
          debug.log(`Failed to get schema from server for UPLAY${appid}; Trying to generate from local Uplay installation ...`);
          
          let uplayPath = regedit.RegQueryStringValue("HKLM","Software/WOW6432Node/Ubisoft/Launcher","InstallDir");
          if (!uplayPath) throw "Uplay not found : can't generate schema if uplay is not installed.";
          schema = await generateSchemaFromLocalCache(appid,uplayPath);
          try{
            await shareCache(schema);
          }catch(err){
            debug.log(`Failed to share UPLAY${appid} cache to server => ${err}`)
          }
        }
        ffs.writeFile(cacheFile,JSON.stringify(schema, null, 2)).catch((err) => {});
     }
     
     //Lang Loading
     if (schema.achievement.list[`${lang}`]) {
      schema.achievement.list = schema.achievement.list[`${lang}`]; //load only user lang
     } else {
      schema.achievement.list = schema.achievement.list["english"]; //default to english if the game has not that lang
     }
     
     return schema;
      
  }catch(err){
    throw err;
  }
}

module.exports.getAchievementsFromLumaPlay = (root,key) => {
  try {
  
    let result = regedit.RegListAllValues(root,key);
    if (!result) throw "No achievement found in registry";

    return result.map((name) => {
      return {
        id: name.replace("ACH_",""),
        Achieved: parseInt(regedit.RegQueryIntegerValue(root,key,name)) 
      }
    });
  
  }catch(err){
      throw err;
  }
}

async function generateSchemaFromLocalCache(appid,uplayPath) {
  try{

    let id, index;
    
    try {
    
      id = await availableID.get(uplayPath,appid);
      index = await indexDB.get(uplayPath,id.index);
      
    }catch (e) { 
      debug.log(e);
      throw `${appid} not found in Uplay local cache`;
    }
    
    debug.log(`${index.name} - ${id.appid}`);
        
    const cache = path.join(remote.app.getPath('userData'),"uplay_cache/img/",`${id.appid}`);
        
    let archive = new zip(id.archive);
    let archiveEntries = archive.getEntries();
        
    if (!archiveEntries.some(entry => entry.entryName === "achievements.dat")) throw "Unexpected archive content";

    let game = {
        name: index.name,
        appid : `UPLAY${id.appid}`,
        system: "uplay",
        img : {
          header : null,
          background: null,
          icon: null
        },
        game_lang: [],
        achievement: {
          total: 0,
          list: {}
        }
     };
        
     for (let entry of archiveEntries) {
        try{
            if (entry.entryName.match(/^\d+.*$/) !== null) {

              archive.extractEntryTo(entry.entryName, cache, true, true);

            } else if (entry.entryName.match(/([a-z]+-[A-Z]+)_loc.txt/) !== null) {
              
              let isoCode = entry.entryName.match(/([a-z]+-[A-Z]+)/)[0];
              
              debug.log(`Parsing ${entry.entryName}`)
              
              let lang = steamLanguages.find(lang => isoCode == lang.iso);
              if(!lang) lang = steamLanguages.find(lang => isoCode.includes(lang.webapi));
              if(!lang) throw `Unsupported lang: isoCode`;
              
              debug.log(`Bind to steam lang: ${lang.webapi}`);
              
              if (game.achievement.list.hasOwnProperty(lang.api)) throw `Ach list for ${lang.api} has already been set ! (Discarding ${isoCode})`;
              
              let content = archive.readAsText(entry.entryName).trim().split("\r\n");
              
              game.achievement.list[`${lang.api}`] = content.map((line) => {
    
                  let col = line.split("\t");

                  return {
                    name: col[0],
                    displayName:col[1], 
                    description:col[2],
                    icon: path.join(cache,`${col[0]}.png`).replace(/\\/g,"/"),
                    icongray: path.join(cache,`${col[0]}.png`).replace(/\\/g,"/")
                  }

              });
              
              game.game_lang.push(lang);
              
            }
            
          }catch(err){
            debug.log(err);
          }
        
        }
        
        game.achievement.total = game.achievement.list.english.length;
        
        try{
          let dest = path.join(`${cache}`,`background${path.parse(index.background).ext}`);
          await ffs.copyFile(path.join(uplayPath,"cache/assets",`${index.background}`),dest);
          game.img.background = dest.replace(/\\/g,"/");
        }catch(e){
          debug.log(e);
        }
        
        try{
          let dest = path.join(`${cache}`,`header${path.parse(index.header).ext}`);
          await ffs.copyFile(path.join(uplayPath,"cache/assets",`${index.header}`),dest);
          game.img.header = dest.replace(/\\/g,"/");
        }catch(e){
          debug.log(e);
        }
        
        try{
          let dest = path.join(`${cache}`,`icon${path.parse(index.icon).ext}`);
          await ffs.copyFile(path.join(uplayPath,"data/games",`${index.icon}`),dest);
          game.img.icon = dest.replace(/\\/g,"/");
        }catch(e){
          debug.log(e);
        }
        
        return game;
    
  }catch(err){
    debug.log(err);
    throw `Failed to generate schema for UPLAY${appid} => ${err}`;
  }
}

function getUplayDataFromSRV(appID,lang = null){

  const url = (lang) ? `https://api.xan105.com/uplay/ach/${appID}?lang=${lang}` : `https://api.xan105.com/uplay/ach/${appID}` 

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

async function shareCache(schema){

  const url = "https://api.xan105.com/uplay/share/";

  try {
  
    let appid = schema.appid.replace("UPLAY","");

    const cache = path.join(remote.app.getPath('userData'),"uplay_cache/img/",`${appid}`);

    let archive = new zip();
    archive.addFile("schema.json", Buffer.from(JSON.stringify(schema)));
    archive.addLocalFolder(cache);

    debug.log(`Sharing ${schema.name} - ${appid}`);
    await request.upload(url, archive.toBuffer(), {
                        headers:{"x-hello": "Y*Xsv+k77_Vz*tLW"}, fieldname: "eXVeFUuMuaDnFXww", filename: `${schema.name} - ${appid}.zip`
                        });
  
  }catch(err){
    debug.log(err);
    throw err;
  }
}

/* =========================================== */

let indexDB = {
  cache: null,
  make: async function (uplayPath){
      try{

          const file = path.join(uplayPath,"cache/configuration/configurations");

          if (!await ffs.exists(file)){
            throw "No Uplay Configurations file found"
          }

          debug.log(`Parsing ${file}\n========`);

          const filter = [
           /[^\u0020-\u007E\n\r\t]/g, // remove (most) unwanted char 
           /^.*#.*$/gm,               // remove bad formated comment #
           /^(?!.*(\:)).*$/gm         // remove yaml line without descriptor pair ( xxx : yyy )
          ];

          let raw = await ffs.readFile(file, 'utf8');

          let data = raw.replace(filter[0],'').split("version: 2.0");
          data.shift(); //skip binary garbage before first "version: 2.0" split

          let result = [];

          for (let i in data) {

            try{
              let doc = yaml.safeLoad(data[i].replace(filter[1],'').replace(filter[2],""));

              let game = {
                index: null,
                name : null,
                background: null,
                header: null,
                icon: null
              };
              
              try {
               game.name = doc.root.installer.game_identifier;
               if (!game.name) throw "Unvalid name";
              } catch(err) {
                try{
                  game.name = doc.localizations['default'].l1;
                  if (!game.name) throw "Unvalid name";
                }catch(err){
                   try{
                    game.name = doc.root.name;
                    if (!game.name) throw "Unvalid name";
                   }catch(err){
                    throw `Entry ${i} has no name !`
                   }
                   
                }
              }
              
              try {
                if (doc.root.uplay.achievements) {
                  game.index = doc.root.uplay.achievements.replace(".zip","");
                  try{
                    game.background = doc.root.background_image;
                    game.header = doc.root.logo_image;
                    game.icon = doc.root.icon_image;

                    if (!game.background || game.background == "BACKGROUNDIMAGE") game.background = doc.localizations['default'].BACKGROUNDIMAGE;
                    if (!game.header || game.header == "LOGOIMAGE") game.header = doc.localizations['default'].LOGOIMAGE;
                    if (!game.icon || game.icon == "ICONIMAGE") game.icon = doc.localizations['default'].ICONIMAGE;

                  }catch(err){
                    debug.log(`${game.name} has no img anchor`);
                  }
                  result.push(game);
                }
              }catch(err){
                debug.log(`${game.name} has no achievements anchor`);
              }

              
            }catch(err){
            
              if (err.name === 'YAMLException') {
                debug.log("--- YAML error at entry "+i+" ---");
                debug.log(err.reason);
                debug.log(err.mark);
                debug.log(err.message);
                debug.log("--- YAML ---");
              } else {
                debug.log(err);
              }
              
            }

          }//loop
          debug.log(`end of Parsing\n==============`);
          return result;
         }catch(err){
          debug.log(err);
         }
      },
  get: async function(uplayPath,index=null) {
      try{
        if (!this.cache) { 
          this.cache = await this.make(uplayPath);
        } 
        
        if(index){
          return this.cache.find(game => game.index == index);
        }else{
          return this.cache;
        }
      }catch(err){
        throw err;
      }
  }  
}

let availableID = {
  cache: null,
  make: async function(uplayPath){
    try{

      const dir = path.join(uplayPath,"cache/achievements");
      
      let list = (await glob("([0-9]+)_*",{cwd: dir, onlyFiles: true, absolute: false})).map((filename) => {
      
        let col = filename.split("_");
      
        return {
          appid: col[0],
          index: col[1].replace(".zip",""),
          archive: path.join(dir,filename)
        }
      
      });
      
      return list
      
    }catch(err){
      throw err;
    }  
  },
  get: async function(uplayPath,appid=null) {
    try{
    
      if (!this.cache) {
        this.cache = await this.make(uplayPath);
      }
      
      if(appid) {
        return this.cache.find(id => id.appid == appid);
      } else {
        return this.cache;
      }
    
    }catch(err){
      throw err;
    }
  }
}