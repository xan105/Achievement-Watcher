"use strict";

const path = require('path');
const util = require('util');
const xml2js = require('xml2js');
const glob = require("fast-glob");
const ffs = require("@xan105/fs");

const magic = {
  header : Buffer.from('818F54AD','hex'),
  delimiter : [ 
    Buffer.from('0400000050','hex'), 
    Buffer.from('0600000060','hex') 
  ]
};

const files = {
  schema: "TROPCONF.SFM",
  userData: "TROPUSR.DAT"
};

const binary = "rpcs3.exe";

module.exports.scan = async (dir) => {
  
  let data = [];
  
  try {

    if (await ffs.exists(path.join(dir,binary))) {

    let users = await glob("([0-9])+",{cwd: path.join(dir,"dev_hdd0/home"), onlyDirectories: true, absolute: false});
            
            for (let user of users) {
                try{
                   let games = await glob("*",{cwd: path.join(dir,"dev_hdd0/home",user,"trophy"), onlyDirectories: true, absolute: false});
                   
                   for (let game of games) {
                      try{
                        data.push({appid: game,
                             source: "RPCS3 Emulator",
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

   let file = await ffs.readFile(path.join(dir,files.schema),"utf-8");
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

module.exports.getAchievements = async (dir) => {

  let result = [];
   
  const buffer = await ffs.readFile(path.join(dir,files.userData));
   
	const header = buffer.slice(0, magic.header.length);
	if (!header.equals(magic.header)) throw "ERR_UNEXPECTED_FILE_FORMAT";

	const headerEndPos = indexOfNthOccurrence(buffer, magic.delimiter[0], 2) + magic.delimiter[0].length;
	const data = buffer.slice(headerEndPos);

	const stats = bufferSplit(data, magic.delimiter);
	if (stats.length % 2 !== 0) throw "ERR_UNEXPECTED_TROPHY_COUNT";

	const length = stats.length / 2;
  if (length > 128) throw "ERR_UNEXPECTED_MAX_TROPHY_LIMIT_EXCEEDED";
    
	for (let i = 0; i <= length - 1; i++) 
	{
    try {
		   
      const timestamp = stats[i].slice(16,20);
      const value = stats[i+length].slice(12,16).readInt32BE();
		   
      const trophy = {
        id : stats[i].slice(0,4).readInt32BE(),
        unlockTime : timestamp.equals(Buffer.from("ffffffff","hex")) ? 0 : timestamp.readInt32BE(),
        achieved : value === 1
      };
		   
      result.push(trophy);
		   
      }catch{ continue }
  }
    
  return result;
}

function indexOfAny(buffer, values, offset = 0){
  for (const value of values){
    const pos = buffer.indexOf(value, offset);
    if (pos > -1) return { pos: pos, offset: value.length }
  }
  return { pos: -1, offset: 0 }
}

function bufferSplit(buffer, separators){

  let result = [];

  let pos = -1;
  let prev = 0;

  while (pos++ < buffer.length) {
    const search = indexOfAny(buffer, separators, pos);
    pos = search.pos > 0 ? search.pos : buffer.length;
    const chunck = buffer.slice(prev, pos);
    prev = pos + search.offset;
    result.push(chunck);
  }
  
  return result;
} 

function indexOfNthOccurrence(buffer, search, n) 
{
  let i = -1;

  while (n-- && i++ < buffer.length) {
    i = buffer.indexOf(search, i);
    if (i < 0) break;
  }
    
  return i;
}