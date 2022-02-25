"use strict";

const remote = require('@electron/remote');
const path = require("path");
const ini = require("@xan105/ini");
const fs = require("fs");
const ffs = require("@xan105/fs");
const aes = require(path.join(appPath,"util/aes.js"));
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

const filename = path.join(remote.app.getPath('userData'),"cfg/options.ini");

module.exports.load = ()=>{ 
    
  let options;
  
  try {
        options = ini.parse(fs.readFileSync(filename,"utf8"));
        
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

        if (typeof options.notification.rumble !== "boolean"){
          options.notification.rumble = true;
        }
        
        if (typeof options.notification.notifyOnProgress !== "boolean"){
          options.notification.notifyOnProgress = true;
        }
        
        if (typeof options.notification.playtime !== "boolean"){
          options.notification.playtime = false;
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
          options.notification_advanced.iconPrefetch = true;
        }
        
        //Souvenir
        
        if (typeof options.souvenir_screenshot.screenshot !== "boolean"){
          options.souvenir_screenshot.screenshot = true;
        }
        
        if (typeof options.souvenir_screenshot.custom_dir !== "string"){
          options.souvenir_screenshot.custom_dir = "";
        }
        
        if (typeof options.souvenir_screenshot.overwrite_image !== "boolean"){
          options.souvenir_screenshot.overwrite_image = false;
        }
        
        if (options.souvenir_video.video != 0 && options.souvenir_video.video != 1 && options.souvenir_video.video != 2){
          options.souvenir_video.video = 0;
        }
        
        if (options.souvenir_video.codec != 0 && options.souvenir_video.codec != 1){
          options.souvenir_video.codec = 0;
        }
        
        if (typeof options.souvenir_video.colorDepth10bits !== "boolean"){
          options.souvenir_video.colorDepth10bits = false;
        }
        
        if (typeof options.souvenir_video.custom_dir !== "string"){
          options.souvenir_video.custom_dir = "";
        }
        
        if (typeof options.souvenir_video.overwrite_video !== "boolean"){
          options.souvenir_video.overwrite_video = false;
        }
        
        if (options.souvenir_video.duration != 10 && options.souvenir_video.duration != 15 &&
            options.souvenir_video.duration != 20 && options.souvenir_video.duration != 30 &&
            options.souvenir_video.duration != 45)
        {
          options.souvenir_video.duration = 20;
        }
        
        if (options.souvenir_video.framerate != 30 && options.souvenir_video.framerate != 60){
          options.souvenir_video.framerate = 60;
        }
        
        if (typeof options.souvenir_video.cursor !== "boolean"){
          options.souvenir_video.cursor = false;
        }
        
        //Action
        if (typeof options.action.target !== "string"){
          options.action.target = "";
        }
        
        if (typeof options.action.cwd !== "string"){
          options.action.cwd = "";
        }
        
        if (typeof options.action.hide !== "boolean"){
          options.action.hide = true;
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
            rumble: true,
            notifyOnProgress: true,
            playtime: false
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
            iconPrefetch: true          
          },
          souvenir_screenshot: {
            screenshot: true,
            custom_dir: "",
            overwrite_image: false
          },
          souvenir_video: {
            video: 0,
            codec: 0,
            colorDepth10bits: false,
            custom_dir: "",
            overwrite_video: false,
            duration: 20,
            framerate: 60,
            cursor: false
          },
          action:{
            target: "",
            cwd: "",
            hide: true
          },
          steam: {}
        };
        
        try {
            let locale = navigator.language || navigator.userLanguage || "en";
            options.achievement.lang = steamLanguages.find(lang => lang.webapi == locale).api;
        }catch(err){
            options.achievement.lang = "english";
        }
        
        ffs.writeFile(filename,ini.stringify(options),"utf8").catch(()=>{});
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

    return resolve(ffs.writeFile(filename,ini.stringify(options),"utf8"));

  });
}