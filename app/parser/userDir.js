"use strict";

const { remote } = require('electron');
const path = require("path");
const ffs = require(path.join(appPath,"util/feverFS.js"));
const glob = require("fast-glob");

const file = path.join(remote.app.getPath('userData'),"cfg/userdir.db");

module.exports.get = async () => {
    try{
        return JSON.parse(await ffs.promises.readFile(file,"utf8"));   
    }catch(err){
        throw err;
    }
}

module.exports.save = async (data) => {
    try{
        await ffs.promises.writeFile(file,JSON.stringify(data, null, 2),"utf8");    
    }catch(err){
        throw err;
    }  
}

module.exports.check = async (dirpath) => {

  try{
  
    let result = false;
  
    const accepted_files = [
       "ALI213.ini",
       "valve.ini",
       "hlm.ini",
       "rpcs3.exe"
    ];
  
    //check for appID folder(s)
    let scan = await glob("([0-9]+)",{cwd: dirpath, onlyDirectories: true}); 
    if (scan.length > 0) return result = true;
    
    //check for accepted_files
    scan = await glob("*.{ini,exe}",{cwd: dirpath, onlyFiles: true}); 
    for (let file of scan) if (accepted_files.some( filename => filename === file )) return result = true;

    return result;

  }catch(err){
    throw err
  }

}