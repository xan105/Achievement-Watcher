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

        if (typeof options.achievement.thumbnailPortrait !== "boolean"){
          options.achievement.thumbnailPortrait = false;
        }
        
        if (typeof options.achievement.showHidden !== "boolean"){
          options.achievement.showHidden = false;
        }
        
        if (typeof options.achievement.mergeDuplicate !== "boolean"){
          options.achievement.mergeDuplicate = true;
        }
        
        if (typeof options.achievement.timeMergeRecentFirst !== "boolean"){
          options.achievement.timeMergeRecentFirst = false;
        }
        
        if (typeof options.achievement.hideZero !== "boolean"){
          options.achievement.hideZero = false;
        }
        
        //Source
        
        if (options.achievement_source.legitSteam != 0 && options.achievement_source.legitSteam != 1 && options.achievement_source.legitSteam != 2){
          options.achievement_source.legitSteam = 0;
        }
        
        if (typeof options.achievement_source.steamEmu !== "boolean"){
          options.achievement_source.steamEmu = true;
        }
        
        if (typeof options.achievement_source.greenLuma !== "boolean"){
          options.achievement_source.greenLuma = true;
        }
        
        if (typeof options.achievement_source.rpcs3 !== "boolean"){
          options.achievement_source.rpcs3 = true;
        }
        
        if (typeof options.achievement_source.lumaPlay !== "boolean"){
          options.achievement_source.lumaPlay = true;
        }
        
        if (typeof options.achievement_source.importCache !== "boolean"){
          options.achievement_source.importCache = true;
        }
        
        //Notification
        
        if (typeof options.notification.notify !== "boolean"){
          options.notification.notify = true;
        }

        if (typeof options.notification.souvenir !== "boolean"){
          options.notification.souvenir = true;
        }

        if (typeof options.notification.showDesc !== "boolean"){
          options.notification.showDesc = false;
        }

        if (typeof options.notification.rumble !== "boolean"){
          options.notification.rumble = true;
        }
        
        if (typeof options.notification.notifyOnProgress !== "boolean"){
          options.notification.notifyOnProgress = true;
        }
        
        //Toast
        
        if (options.notification_toast.customToastAudio != 0 && options.notification_toast.customToastAudio != 1 && options.notification_toast.customToastAudio != 2){
          options.notification_toast.customToastAudio = 1;
        }
        
        if (options.notification_toast.toastSouvenir != 0 && options.notification_toast.toastSouvenir != 1 && options.notification_toast.toastSouvenir != 2){
          options.notification_toast.toastSouvenir = 0;
        }
        
        if (typeof options.notification_toast.groupToast !== "boolean"){
          options.notification_toast.groupToast = false;
        }

        //Transport
        
        if (typeof options.notification_transport.toast !== "boolean"){
          options.notification_transport.toast = true;
        }
        
        if (typeof options.notification_transport.winRT !== "boolean"){
          options.notification_transport.winRT = true;
        }
        
        if (typeof options.notification_transport.balloon !== "boolean"){
          options.notification_transport.balloon = true;
        }
        
        if (typeof options.notification_transport.websocket !== "boolean"){
          options.notification_transport.websocket = true;
        }
        
        if (typeof options.notification_transport.gntp !== "boolean"){
          options.notification_transport.gntp = true;
        }  

        //Advanced

        if (isNaN(options.notification_advanced.timeTreshold)){
          options.notification_advanced.timeTreshold = 10;
        }
        
        if (isNaN(options.notification_advanced.tick)){
          options.notification_advanced.tick = 600;
        }
        
        if (typeof options.notification_advanced.checkIfProcessIsRunning !== "boolean"){
          options.notification_advanced.checkIfProcessIsRunning = true;
        } 
        
        if (typeof options.notification_advanced.iconPrefetch !== "boolean"){
          options.notification_advanced.iconPrefetch = false;
        }
        
        //Steam Key    

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
            thumbnailPortrait: false,
            showHidden: false,
            mergeDuplicate: true,
            timeMergeRecentFirst: false,
            hideZero: false
          },
          achievement_source: {
            legitSteam: 0,
            steamEmu: true,
            greenLuma: true,
            rpcs3: true,
            lumaPlay: false,
            importCache: true
          },
          notification: {
            notify: true,           
            souvenir: true,
            showDesc: false,
            rumble: true,
            notifyOnProgress: true
          },
          notification_toast: {
            customToastAudio: 1,
            toastSouvenir: 0,
            groupToast: false 
          },
          notification_transport: {
            toast: true,
            winRT: true,
            balloon: true,
            websocket: true,
            gntp: true
          },
          notification_advanced: {
            timeTreshold: 10,
            tick: 600,
            checkIfProcessIsRunning: true,
            iconPrefetch: false          
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