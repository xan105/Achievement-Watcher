const path = require('path');
const ffs = require(require.resolve("./util/feverFS.js"));
const debug = new (require(require.resolve("./util/log.js")))({
  console: true,
  file: path.resolve("./log/blacklist.log")
});

const cache = require("./cache.json");
const blacklist = path.join(cache.dir,"blacklist.json");

module.exports.add = async (appID) => {

  try {
    
    let list;
    try {
      list = JSON.parse(await ffs.promises.readFile(blacklist,"utf8"));
    }catch(e){
      list =[
        480, //Space War
        753, //Steam Config
        250820, //SteamVR
        228980 //Steamworks Common Redistributables
      ];
    }
    
    if (!list.includes(appID)) {
      list.push(appID);
    }
    
    await ffs.promises.writeFile(blacklist,JSON.stringify(list, null, 2),"utf8");

  }catch(err){
    debug.log(err);
  }
}

module.exports.isIn = async (appID) => {
  try{
    list = JSON.parse(await ffs.promises.readFile(blacklist,"utf8"));
    return (list.includes(appID)) ? true : false;
  }catch(err){
    return false
  }
}

module.exports.get = async (appID) => {
  try{
    list = JSON.parse(await ffs.promises.readFile(blacklist,"utf8"));
    return list
  }catch(err){
    return [];
  }
}