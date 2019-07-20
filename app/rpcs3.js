"use strict";

const path = require('path');
const util = require('util');
const xml2js = require('xml2js');
const glob = require("fast-glob");
const ffs = require('./feverFS.js');

const magic = {
  header : Buffer.from('818F54AD','hex'),
  delimiter : [ Buffer.from('0400000050','hex'), Buffer.from('0600000060','hex') ]
};

const files = {
  schema: "TROPCONF.SFM",
  userData: "TROPUSR.DAT"
};

module.exports = (dir) => {
  
  try {

  let result = [];
  
  let users = await glob("([0-9])*",{cwd: path.join(dir,"dev_hdd0/home"), onlyDirectories: true, absolute: false});
  
  for (let user of users) {
    try{
       let games = await glob("*",{cwd: path.join(dir,"dev_hdd0/home",user,"trophy"), onlyDirectories: true, absolute: false});
       
       for (let game of games) {
          try{
            result.push(await getAchievements(path.join(dir,"dev_hdd0/home",user,"trophy",game)));
          }catch(err){
            //Do nothing => try with next game
          }
       }
    }catch(err){
      //Do nothing => try with next user
    }
  }
  
  return result;
  
  }catch(err){
    throw err;
  }
  
}

async function getAchievements (dir){
  try {
  
   let result = {
    img: {},
    achievement: {}
   };
   let file = await ffs.promises.readFile(path.join(dir,files.schema),"utf-8");
   let schema = await util.promisify(xml2js.parseString)(file,{explicitArray: false, explicitRoot: false, ignoreAttrs: false, emptyTag: null});
  
   result.appid = schema.npcommid;
   result.name = schema['title-name'];
   result.img.header = path.join(dir,"ICON0.PNG");
   result.achievement.total = schema.trophy.length;
   result.achievement.list = schema.trophy.map((trophy) => {
   
      return {
        name: parseInt(trophy['$'].id),
        hidden: (trophy['$'].hidden === "yes") ? 1 : 0,
        type: trophy['$'].ttype,
        displayName: trophy.name,
        description: trophy.detail,
        icon:path.join(dir,`TROP${trophy['$'].id}.png`),
        icongray:path.join(dir,`TROP${trophy['$'].id}.png`)
      }

   });
   
   file = await ffs.promises.readFile(path.join(dir,files.userData));
    
   let headerEndPos = indexOf(file.toString('hex'),magic.delimiter[0].toString('hex'),2) + magic.delimiter[0].toString('hex').length;
   let separator = new RegExp(magic.delimiter[0].toString('hex') + "|" + magic.delimiter[1].toString('hex') , "g");
   
   let trimmed = file.toString('hex').slice(headerEndPos);
   let data = trimmed.split(separator);
   
   if(data.length !== schema.trophy.length*2) throw `Unexpected number of achievements in ${files.userData}`;
   
   for (let i=0;i<=schema.trophy.length-1;i++) {
     try {
       let id = parseInt(data[i].slice(6,8),16);
       let timestamp = data[i].slice(32,40);
       let hasAchieved = (data[i+schema.trophy.length].slice(30,32) === "01") ? true : false;
        
       let achievement = result.achievement.list.find(ach => ach.name == id);
       
       achievement.Achieved = hasAchieved;
       achievement.UnlockTime = (timestamp == "ffffffff") ? 0 : parseInt(timestamp,16);
     }catch(err){
      //Do nothing -> try to parse the next one
     }
   }
   
   return result;
  
  }catch(err){
    throw err;
  }
}

function indexOf(str, pattern, n) {
    var i = -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
    }
    
    return i;
}