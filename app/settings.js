"use strict";

const { remote } = require('electron');
const path = require("path");
const ini = require("ini");
const ffs = require(path.join(appPath,"util/feverFS.js"));
const aes = require(path.join(appPath,"util/aes.js"));
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

const filename = path.join(remote.app.getPath('userData'),"cfg/options.ini");

module.exports.load = ()=>{ 
    
  let options;
  
  try {
        options = ini.parse(ffs.sync.readFile(filename,"utf8"));
        
        if (!steamLanguages.some(lang => lang.api == options.achievement.lang)) {
          try {
            let locale = navigator.language || navigator.userLanguage || "en";
            options.achievement.lang = steamLanguages.find(lang => lang.webapi == locale).api;
          }catch(err){
            options.achievement.lang = "english";
          }
        }
        
        if (typeof options.achievement.showHidden !== "boolean"){
          options.achievement.showHidden = false;
        }
        
        if (typeof options.achievement.mergeDuplicate !== "boolean"){
          options.achievement.mergeDuplicate = true;
        }
        
        if (typeof options.achievement.timeMergeRecentFirst !== "boolean"){
          options.achievement.timeMergeRecentFirst = true;
        }
        
        if (typeof options.achievement.hideZero !== "boolean"){
          options.achievement.hideZero = false;
        }
        
        if (options.achievement.legitSteam != 0 && options.achievement.legitSteam != 1 && options.achievement.legitSteam != 2){
          options.achievement.legitSteam = 0;
        }
        
        if (typeof options.notification.notify !== "boolean"){
          options.notification.notify = true;
        }
        
        if (typeof options.notification.powershell !== "boolean"){
          options.notification.powershell = true;
        }
        
        if (typeof options.notification.gntp !== "boolean"){
          options.notification.gntp = true;
        }   
        
        if (typeof options.notification.souvenir !== "boolean"){
          options.notification.souvenir = true;
        }
        
        if (options.notification.toastSouvenir != 0 && options.notification.toastSouvenir != 1 && options.notification.toastSouvenir != 2){
          options.notification.toastSouvenir = 0;
        }
        
        if (typeof options.notification.showDesc !== "boolean"){
          options.notification.showDesc = false;
        }
        
        if (options.notification.customToastAudio != 0 && options.notification.customToastAudio != 1 && options.notification.customToastAudio != 2){
          options.notification.customToastAudio = 1;
        }
        
        if (typeof options.notification.rumble !== "boolean"){
          options.notification.rumble = true;
        }
        
        if (isNaN(options.notification_advanced.timeTreshold)){
          options.notification_advanced.timeTreshold = 5;
        }
        
        if (isNaN(options.notification_advanced.tick)){
          options.notification_advanced.tick = 600;
        }
        
        if (typeof options.notification_advanced.checkIfProcessIsRunning !== "boolean"){
          options.notification_advanced.checkIfProcessIsRunning = true;
        }
        
        if (typeof options.notification_advanced.keepTrack !== "boolean"){
          options.notification_advanced.keepTrack = true;
        }       

        if (options.steam) {
          if (options.steam.apiKey){
            if (options.steam.apiKey.includes(":")) {
              options.steam.apiKey = aes.decrypt(options.steam.apiKey);
            }
          }
        } else {
          options.steam = {};
        }
        
    }catch(err){

        options = {
          achievement: {
            showHidden: false,
            mergeDuplicate: true,
            timeMergeRecentFirst: true,
            hideZero: false,
            legitSteam: 0
          },
          notification: {
            notify: true,
            powershell: true,
            gntp: true,            
            souvenir: true,
            toastSouvenir: 0,
            showDesc: false,
            customToastAudio: 1,
            rumble: true
          },
          notification_advanced: {
            timeTreshold: 5,
            tick: 600,
            checkIfProcessIsRunning: true,
            keepTrack: true           
          },
          steam: {}
        };
        
        try {
            let locale = navigator.language || navigator.userLanguage || "en";
            options.achievement.lang = steamLanguages.find(lang => lang.webapi == locale).api;
        }catch(err){
            options.achievement.lang = "english";
        }
        
        ffs.promises.writeFile(filename,ini.stringify(options),"utf8").catch(()=>{});
    }
    
    return options;
}

module.exports.save = (config) => {  
  return new Promise((resolve, reject) => {

    let options;
    try {
      options = JSON.parse(JSON.stringify(config)) //deep object copy to prevent modifying reference; We want to encrypt key to file but keep it decrypted in memory.
      
      if (options.steam) {
        if (options.steam.apiKey){
          options.steam.apiKey = aes.encrypt(config.steam.apiKey);
        }
      }
    }catch(err) {
      return reject(err);
    }

    return resolve(ffs.promises.writeFile(filename,ini.stringify(options),"utf8"));

  });
}