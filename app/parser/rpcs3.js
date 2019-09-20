"use strict";

const path = require('path');
const util = require('util');
const xml2js = require('xml2js');
const glob = require("fast-glob");
const ffs = require(path.join(appPath,"util/feverFS.js"));

const magic = {
  header : Buffer.from('818F54AD','hex'),
  delimiter : [ Buffer.from('0400000050','hex'), Buffer.from('0600000060','hex') ]
};

const files = {
  schema: "TROPCONF.SFM",
  userData: "TROPUSR.DAT"
};

const binary = "rpcs3.exe";

module.exports.scan = async (dir) => {
  
  let data = [];
  
  try {

    if (await ffs.promises.exists(path.join(dir,binary))) {

    let users = await glob("([0-9])+",{cwd: path.join(dir,"dev_hdd0/home"), onlyDirectories: true, absolute: false});
            
            for (let user of users) {
                try{
                   let games = await glob("*",{cwd: path.join(dir,"dev_hdd0/home",user,"trophy"), onlyDirectories: true, absolute: false});
                   
                   for (let game of games) {
                      try{
                        data.push({appid: game,
                             data: {
                                type: "rpcs3",
                                path: path.join(dir,"dev_hdd0/home",user,"trophy",game)
                             }
                        });  
                      }catch(err){
                        //Do nothing => try with next game
                      }
                   }
                }catch(err){
                  //Do nothing => try with next user
                }     
            }  

    }
  
  }catch(err){
    //Do nothing
  }
  
  return data;
  
}

module.exports.getGameData = async (dir) => {
try {

   let file = await ffs.promises.readFile(path.join(dir,files.schema),"utf-8");
   let schema = await util.promisify(xml2js.parseString)(file,{explicitArray: false, explicitRoot: false, ignoreAttrs: false, emptyTag: null});
   
   let result = {
    name : schema['title-name'],
    appid : schema.npcommid,
    system: "playstation",
    img: {
      header: "file:///"+path.join(dir,"ICON0.PNG").replace(/\\/g,"/")
    },
    achievement: {
      total : schema.trophy.length,
      list : schema.trophy.map((trophy) => {
                return {
                  name: parseInt(trophy['$'].id),
                  hidden: (trophy['$'].hidden === "yes") ? 1 : 0,
                  type: trophy['$'].ttype,
                  displayName: trophy.name,
                  description: trophy.detail,
                  icon:"file:///"+path.join(dir,`TROP${trophy['$'].id}.png`).replace(/\\/g,"/"),
                  icongray:"file:///"+path.join(dir,`TROP${trophy['$'].id}.png`).replace(/\\/g,"/")
                }
             })
    }
   };   
   
   return result;
   
  }catch(err){
    throw err;
  }
}

module.exports.getAchievements = async (dir,length) => {
  try {

   let result = [];
   
   let file = await ffs.promises.readFile(path.join(dir,files.userData));
   
   if (!file.toString('hex').startsWith(magic.header.toString('hex'))) throw `Unexpected ${files.userData} file format`
    
   let headerEndPos = indexOf(file.toString('hex'),magic.delimiter[0].toString('hex'),2) + magic.delimiter[0].toString('hex').length;
   let separator = new RegExp(magic.delimiter[0].toString('hex') + "|" + magic.delimiter[1].toString('hex') , "g");
   
   let trimmed = file.toString('hex').slice(headerEndPos);
   let data = trimmed.split(separator);
   
   if(data.length !== length*2) throw `Unexpected number of achievements in ${files.userData}`;
   
   for (let i=0;i<=length-1;i++) {
     try {
       
       let timestamp = data[i].slice(32,40);
       
       result.push({
          id : parseInt(data[i].slice(6,8),16),
          UnlockTime : (timestamp == "ffffffff") ? 0 : parseInt(timestamp,16),
          Achieved : (data[i+length].slice(30,32) === "01") ? true : false
       });
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