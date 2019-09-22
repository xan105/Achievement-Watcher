"use strict";

const path = require('path');
const ffs = require("./util/feverFS.js");

const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/unlocked");

module.exports.isAlreadyUnlocked = async (appid,name) => {
  try{
  
    let game = JSON.parse(await ffs.promises.readFile(path.join(cache,`${appid}.db`),"utf8"));
  
    if (game[name] >= 0) 
    {
      return true;
    } else {
      return false;
    }

  }catch(err){
    return false;
  }
}

module.exports.keep = async (appid,name,value = 0) => {

  if(value < 0) return;
  
  let data;
  
  try{
    data = JSON.parse(await ffs.promises.readFile(path.join(cache,`${appid}.db`),"utf8"));
  }catch{
    data = {};
  }
  data[name] = value;

  try{
    await ffs.promises.writeFile(path.join(cache,`${appid}.db`),JSON.stringify(data, null, 2),"utf8");
  }catch(err){
    //Do nothing
  }

}