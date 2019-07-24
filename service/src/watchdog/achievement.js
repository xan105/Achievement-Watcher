"use strict";

const path = require('path');
const htmlParser = require('node-html-parser').parse;
const ffs = require("./util/feverFS.js");
const request = require("./util/request.js");
const steamLanguages = require("./steamLanguages.json");

module.exports.loadSteamData = async (appID, lang, key) => {

  if (!steamLanguages.some( language => language.api === lang )) {
        throw "Unsupported API language code";
  }
  
  const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/schema",lang);

  try {
  
    let filePath = path.join(`${cache}`,`${appID}.db`);
    let result;

    if (await ffs.promises.existsAndIsYoungerThan(filePath,{timeUnit: 'month', time: 1})) {
        result = JSON.parse(await ffs.promises.readFile(filePath));
    } else {
        if (key) {
          result = await getSteamData(appID, lang, key);
        } else {
          result = await getSteamDataFromSRV(appID, lang);
        }
        ffs.promises.writeFile(filePath,JSON.stringify(result, null, 2)).catch((err) => { console.log(err) });                 
   }
   
   return result;
   
 }catch(err) {
  throw `Could not load Steam data for ${appID} - ${lang}: ${err}`
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

function getSteamData (appID,lang,key) {
  
  const url = {
    api : `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${key}&appid=${appID}&l=${lang}&format=json`,
    store : `https://store.steampowered.com/api/appdetails?appids=${appID}` 
  };
  
  return new Promise((resolve, reject) => {

      Promise.all([request.getJson(url.api),request.getJson(url.store,{headers: {"Accept-Language" : "en-US;q=1.0"}}),scrapSteamDB(appID)]).then(function(data) {

        try {

          let schema = data[0].game.availableGameStats;
          let appdetail = data[1][appID].data;
          let steamdb = data[2];

          let result = {
            name: appdetail.name,
            appid: appID,
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

async function scrapSteamDB(appid){
  try {
    let data = await request(`https://steamdb.info/app/${appid}/`);
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