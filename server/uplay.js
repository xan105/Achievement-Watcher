"use strict";

const path = require('path');
const zip = require('adm-zip');
const ffs = require(require.resolve("./util/feverFS.js"));
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/uplay.log")
});
const cache = require("./cache.json");
const steamLanguages = require("./steamLanguages.json");

module.exports.getSchema = async (appID,lang = null) => {
  try {
  
    debug.log(`Loading ${appID} - ${(!lang) ? "All" : lang}`);
  
    if (lang && !steamLanguages.some( language => language.api === lang )) {
        throw "Unsupported API language code";
    }

    let filePath = path.join(`${cache.dir}`,"uplay/schema",`${appID}.json`);
    let schema = JSON.parse(await ffs.promises.readFile(filePath));
    debug.log("Loading achievements list from cache");
    
    if (lang) {
        //Lang Loading
        if (schema.achievement.list[`${lang}`]) {
          schema.achievement.list = schema.achievement.list[`${lang}`]; //load only user lang
          debug.log(`Loading only ${lang} as requested`);
        } else {
          schema.achievement.list = schema.achievement.list["english"]; //default to english if the game has not that lang
          debug.log("Game doesnt support language; Switching back to English");
        }
    }
  
   return schema;
    
  }catch(err) {
    debug.log(err);
    throw err
  }
}

module.exports.saveSharedCache = async (file) => {
  try{

      const cdn = "https://api.xan105.com/uplay/img";

      let archive = new zip(file);
      let archiveEntries = archive.getEntries();
          
      if (!archiveEntries.some(entry => entry.entryName === "schema.json")) throw "Unexpected archive content";
      
      let schema; 
      
      try{
        schema = JSON.parse( (archiveEntries.find(entry => entry.entryName == "schema.json")).getData().toString('utf8') );
      }catch(err){
        throw "Unable to parse received schema.json";
      }
      let appid = schema.appid.replace("UPLAY","");

      debug.log(`Generating cache for ${schema.name} - ${appid}`);

      for (let lang in schema.achievement.list) {
        schema.achievement.list[lang] = schema.achievement.list[lang].map((ach) => {
              ach.icon = ach.icongray = `${cdn}/${appid}/${ach.name}.png`;
              return ach;
        }) 
      }
      
      schema.img.header = `${cdn}/${appid}/${(path.parse(schema.img.header)).base}`;
      schema.img.background = `${cdn}/${appid}/${(path.parse(schema.img.background)).base}`;
      schema.img.icon = `${cdn}/${appid}/${(path.parse(schema.img.icon)).base}`;
      
      const filePath = path.join(`${cache.dir}`,"uplay/schema",`${appid}.json`);
      await ffs.promises.writeFile(filePath,JSON.stringify(schema, null, 2));
          
      const img_cache = path.join(`${cache.dir}`,"uplay/img",`${appid}`);
      for (let entry of archiveEntries) {
            try{
                if (entry.entryName.match(/^\d+.*$/) !== null) archive.extractEntryTo(entry.entryName, img_cache, true, true);
            }catch(err){
                debug.log(`Failed to extract ${entry.entryName}`);
            }
     }
     
    ffs.promises.rm(file);
     
    debug.log("...Generated!");
    
  }catch(err) {
    debug.log(err);
    throw err
  }
};