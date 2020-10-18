"use strict";

const path = require('path');
const ffs = require("@xan105/fs");

const cache = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/data");

module.exports.load = async (appID) => {
  try{
    return JSON.parse(await ffs.readFile(path.join(cache,`${appID}.db`),"utf8"));
  }catch(err){
    return [];
  }
}

module.exports.save = async (appID,achievements) => {
    await ffs.writeFile(path.join(cache,`${appID}.db`),JSON.stringify(achievements, null, null),"utf8");
}