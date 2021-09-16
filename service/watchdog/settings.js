"use strict";

const path = require('path');
const ini = require("@xan105/ini");
const osLocale = require('os-locale');
const fs = require("@xan105/fs");
const steamLang = require("./steam.json");
const aes = require("./util/aes.js");

module.exports.load = async (cfg_file) => {

      let options = {};
      
      try {
        
        let fixFile = false;
        
        options = ini.parse(await fs.readFile(cfg_file,"utf8"));
        
        if (!steamLang.some(lang => lang.api == options.achievement.lang)) {
           try { 
              let locale = await osLocale();
              locale = locale.replace("_","-");
              
              let lang = steamLang.find(lang => lang.iso == locale);
              if (!lang) {
                lang = steamLang.find(lang => lang.webapi.startsWith(locale.slice(0,2)));
              }
              
              options.achievement.lang = lang.api
            
           }catch(err){
              options.achievement.lang = "english";
           } 
           fixFile = true;
        }
        
        if (typeof options.achievement.thumbnailPortrait !== "boolean"){
          options.achievement.thumbnailPortrait = false;
          fixFile = true;
        }
        
        if (typeof options.achievement.showHidden !== "boolean"){
          options.achievement.showHidden = false;
          fixFile = true;
        }
        
        if (typeof options.achievement.mergeDuplicate !== "boolean"){
          options.achievement.mergeDuplicate = true;
          fixFile = true;
        }
        
        if (typeof options.achievement.timeMergeRecentFirst !== "boolean"){
          options.achievement.timeMergeRecentFirst = false;
          fixFile = true;
        }
        
        if (typeof options.achievement.hideZero !== "boolean"){
          options.achievement.hideZero = false;
          fixFile = true;
        }
        
        //Source
        
        if (options.achievement_source.legitSteam != 0 && options.achievement_source.legitSteam != 1 && options.achievement_source.legitSteam != 2){
          options.achievement_source.legitSteam = 0;
          fixFile = true;
        }
        
        if (typeof options.achievement_source.steamEmu !== "boolean"){
          options.achievement_source.steamEmu = true;
          fixFile = true;
        }
        
        if (typeof options.achievement_source.greenLuma !== "boolean"){
          options.achievement_source.greenLuma = true;
          fixFile = true;
        }
        
        if (typeof options.achievement_source.rpcs3 !== "boolean"){
          options.achievement_source.rpcs3 = true;
          fixFile = true;
        }
        
        if (typeof options.achievement_source.lumaPlay !== "boolean"){
          options.achievement_source.lumaPlay = true;
          fixFile = true;
        }
        
        if (typeof options.achievement_source.importCache !== "boolean"){
          options.achievement_source.importCache = true;
          fixFile = true;
        }
        
        //Notification
        
        if (typeof options.notification.notify !== "boolean"){
          options.notification.notify = true;
          fixFile = true;
        }

        if (typeof options.notification.rumble !== "boolean"){
          options.notification.rumble = true;
          fixFile = true;
        }
        
        if (typeof options.notification.notifyOnProgress !== "boolean"){
          options.notification.notifyOnProgress = true;
          fixFile = true;
        }
        
        if (typeof options.notification.playtime !== "boolean"){
          options.notification.playtime = false;
          fixFile = true;
        }
        
        //Toast
        
        if (options.notification_toast.customToastAudio != 0 && options.notification_toast.customToastAudio != 1 && options.notification_toast.customToastAudio != 2){
          options.notification_toast.customToastAudio = 1;
          fixFile = true;
        }
        
        if (options.notification_toast.toastSouvenir != 0 && options.notification_toast.toastSouvenir != 1 && options.notification_toast.toastSouvenir != 2){
          options.notification_toast.toastSouvenir = 0;
          fixFile = true;
        }
        
        if (typeof options.notification_toast.groupToast !== "boolean"){
          options.notification_toast.groupToast = false;
          fixFile = true;
        }

        //Transport
        
        if (typeof options.notification_transport.toast !== "boolean"){
          options.notification_transport.toast = true;
          fixFile = true;
        }
        
        if (typeof options.notification_transport.winRT !== "boolean"){
          options.notification_transport.winRT = true;
          fixFile = true;
        }
        
        if (typeof options.notification_transport.balloon !== "boolean"){
          options.notification_transport.balloon = true;
          fixFile = true;
        }
        
        if (typeof options.notification_transport.websocket !== "boolean"){
          options.notification_transport.websocket = true;
          fixFile = true;
        }
        
        if (typeof options.notification_transport.gntp !== "boolean"){
          options.notification_transport.gntp = true;
          fixFile = true;
        }  

        //Advanced

        if (isNaN(options.notification_advanced.timeTreshold)){
          options.notification_advanced.timeTreshold = 10;
          fixFile = true;
        }
        
        if (isNaN(options.notification_advanced.tick)){
          options.notification_advanced.tick = 600;
          fixFile = true;
        }
        
        if (typeof options.notification_advanced.checkIfProcessIsRunning !== "boolean"){
          options.notification_advanced.checkIfProcessIsRunning = true;
          fixFile = true;
        } 
        
        if (typeof options.notification_advanced.iconPrefetch !== "boolean"){
          options.notification_advanced.iconPrefetch = true;
          fixFile = true;
        }
        
        //Souvenir
        
        if (typeof options.souvenir_screenshot.screenshot !== "boolean"){
          options.souvenir_screenshot.screenshot = true;
          fixFile = true;
        }
        
        if (typeof options.souvenir_screenshot.custom_dir !== "string"){
          options.souvenir_screenshot.custom_dir = "";
          fixFile = true;
        }
        
        if (typeof options.souvenir_screenshot.overwrite_image !== "boolean"){
          options.souvenir_screenshot.overwrite_image = false;
          fixFile = true;
        }
        
        if (options.souvenir_video.video != 0 && options.souvenir_video.video != 1 && options.souvenir_video.video != 2){
          options.souvenir_video.video = 0;
          fixFile = true;
        }
        
        if (options.souvenir_video.codec != 0 && options.souvenir_video.codec != 1){
          options.souvenir_video.codec = 0;
          fixFile = true;
        }
        
        if (typeof options.souvenir_video.colorDepth10bits !== "boolean"){
          options.souvenir_video.colorDepth10bits = false;
          fixFile = true;
        }
        
        if (typeof options.souvenir_video.custom_dir !== "string"){
          options.souvenir_video.custom_dir = "";
          fixFile = true;
        }
        
        if (typeof options.souvenir_video.overwrite_video !== "boolean"){
          options.souvenir_video.overwrite_video = false;
          fixFile = true;
        }
        
        if (options.souvenir_video.duration != 10 && options.souvenir_video.duration != 15 &&
            options.souvenir_video.duration != 20 && options.souvenir_video.duration != 30 &&
            options.souvenir_video.duration != 45)
        {
          options.souvenir_video.duration = 20;
          fixFile = true;
        }
        
        if (options.souvenir_video.framerate != 30 && options.souvenir_video.framerate != 60){
          options.souvenir_video.framerate = 60;
          fixFile = true;
        }
        
        if (typeof options.souvenir_video.cursor !== "boolean"){
          options.souvenir_video.cursor = false;
          fixFile = true;
        }
        
        //Steam Key  

        let steamKey;
        if (options.steam) {
          if (options.steam.apiKey){
            if (options.steam.apiKey.includes(":")) {
              steamKey = aes.decrypt(options.steam.apiKey);
            } else {
              fixFile = true;
            }
          } 
        } else {
          options.steam = {};
        }

        if (fixFile) await fs.writeFile(cfg_file,ini.stringify(options),"utf8").catch(()=>{});
        
        if (steamKey) options.steam.apiKey = steamKey;

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
          steam: {}
        };

        try {
          let locale = await osLocale();
          locale = locale.replace("_","-");
          
          let lang = steamLang.find(lang => lang.iso == locale);
          if (!lang) {
            lang = steamLang.find(lang => lang.webapi.startsWith(locale.slice(0,2)));
          }
          
          options.achievement.lang = lang.api
          
        }catch(err){
          options.achievement.lang = "english";
        }
        
        await fs.writeFile(cfg_file,ini.stringify(options),"utf8").catch(()=>{});

      }
      
      return options;
}