'use strict';

const path = require('path');
const fs = require('@xan105/fs');
const glob = require('fast-glob');
const ini = require('ini');

async function findByReadingContentOfKnownConfigfilesIn(dirPath){
  const files = [
    "steam_appid.txt", //generic
    "steam_emu.ini", //Codex, ...
    "ALI213.ini", "valve.ini", "SteamConfig.ini", //ALI213
    "hlm.ini", //Hoodlum
    "ds.ini", //DarkSiders
    "steam_api.ini", //Rld, Skidrow, ...
    "CPY.ini", 
    "ColdClientLoader.ini", //Goldberg experimental
    "SmartSteamEmu.ini", 
    "ColdAPI.ini"
  ];

  const list = await glob(files.map(file => "**/" + file), { cwd: dirPath, onlyFiles: true, absolute: true});

  let appid = null;
  
  for (const file of list)
  {
    try{
      const content = await fs.readFile(file,'utf8');
      if (path.parse(file).ext === '.txt') {
        appid = content.toString().trim();
      } else {
        const data = ini.parse(content);
        
        //Node14: use ?.
        //Nb: order of if test is ~somewhat~ important
        if (data.SmartSteamEmu) appid = data.SmartSteamEmu.AppId;
        else if (data.Steam) appid = data.Steam.AppId;
        else if (data.Settings) appid = data.Settings.AppId || data.Settings.AppID;
        else if (data.GameSettings) appid = data.GameSettings.AppId;
        else if (data.SteamData) appid = data.SteamData.AppID;
        else if (data.SteamClient) appid = data.SteamClient.AppId;
        else throw "ERROR_UNEXPECTED_CONTENT";
      }
      break;
    }catch(err){ /*Do Nothing; Try next file if any*/ }
  }

  if (appid) return appid;
  else throw "ERROR_NOT_FOUND";
}

module.exports = { findByReadingContentOfKnownConfigfilesIn }