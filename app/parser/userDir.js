"use strict";

const { remote } = require('electron');
const path = require("path");
const ini = require("ini");
const parentFind = require('find-up');
const glob = require("fast-glob");
const ffs = require(path.join(appPath,"util/feverFS.js"));

const file = path.join(remote.app.getPath('userData'),"cfg/userdir.db");

const steam_emu_cfg_file_supported = ["ALI213.ini", "valve.ini", "hlm.ini", "ds.ini", "steam_api.ini"];

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
  
    const accepted_files = steam_emu_cfg_file_supported.concat(["rpcs3.exe"]);
  
    //check for appID folder(s)
    let scan = await glob("([0-9]+)",{cwd: dirpath, onlyDirectories: true}); 
    if (scan.length > 0) return result = true;
    
    //check for accepted_files
    scan = await glob("*.{ini,exe}",{cwd: dirpath, onlyFiles: true}); 
    for (let file of scan) if (accepted_files.some( filename => filename === file )) return result = true;

    return result;

  }catch(err){
    throw err;
  }

}

module.exports.scan = async (dir) => {

  let result = [];
  
  try {
    
    let info;
    for (let file of steam_emu_cfg_file_supported) {
      try{
        info = ini.parse(await ffs.promises.readFile(path.join(dir,file),"utf8"));
      break;
      }catch(e){}
    }
    if(!info) return result;

    /*
      parentFind:
        Most of the time the cfg/dll pair is next to the game binary and thus UserDataFolder folder should be there as well; 
        Otherwise walk up parent directories and try to find the folder.
    */
    
    if (info.Settings && info.Option) { //ALI213

        if(info.Settings.AppID && info.Settings.PlayerName) {

            let dirpath = await parentFind(async (directory) => {
                              let has = await parentFind.exists(path.join(directory, `Profile/${info.Settings.PlayerName}/Stats/`, 'Achievements.Bin'));
                              return has && directory;
               }, {cwd: dir, type: 'directory'});

            if (dirpath){
                      result.push({ appid: info.Settings.AppID,
                                 data: {
                                   type: "file",
                                   path: path.join(dirpath,`Profile/${info.Settings.PlayerName}/Stats/`)
                                 }
                               });
            }    
        
      }
    
    } else if (info.GameSettings) { //Hoodlum - DARKSiDERS
    
        if(info.GameSettings.UserDataFolder === "." && info.GameSettings.AppId) {

                let dirpath = await parentFind(async (directory) => {
                                let has = await parentFind.exists(path.join(directory, 'SteamEmu','stats.ini'));
                                return has && directory;
                          }, {cwd: dir, type: 'directory'});

                if (dirpath){
                  result.push({ appid: info.GameSettings.AppId,
                             data: {
                               type: "file",
                               path: path.join(dirpath,"SteamEmu")
                             }
                           });
                } 
        
        }
        
    } else if (info.Settings) { //Catherine
    
        if (info.Settings.AppId && info.Settings.SteamID) {

                let dirpath = await parentFind(async (directory) => {
                                let has = await parentFind.exists(path.join(directory, `SteamProfile/${info.Settings.SteamID}`,'Achievements.ini'));
                                return has && directory;
                          }, {cwd: dir, type: 'directory'});

                if (dirpath){
                  result.push({ appid: info.Settings.AppId,
                             data: {
                               type: "file",
                               path: path.join(dirpath,`SteamProfile/${info.Settings.SteamID}`)
                             }
                           });
                } 
        
        }

    }

  }catch(err){
    /*Do nothing*/
  }

  return result;

}