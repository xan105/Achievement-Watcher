"use strict";

const path = require('path');
const ffs = require("./util/feverFS.js");

const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/data");

module.exports.load = async (appID) => {
  try{
    return JSON.parse(await ffs.promises.readFile(path.join(cache,`${appID}.db`),"utf8"));
  }catch(err){
    return [];
  }
}

module.exports.save = async (appID,achievements) => {
  try{
    await ffs.promises.writeFile(path.join(cache,`${appID}.db`),JSON.stringify(achievements, null, null),"utf8");
  }catch(err){
    //Do nothing
  }
}