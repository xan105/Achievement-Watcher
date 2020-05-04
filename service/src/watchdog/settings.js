"use strict";

const path = require('path');
const ini = require("ini");
const osLocale = require('os-locale');
const ffs = require("./util/feverFS.js");
const steamLang = require("./steam.json");
const aes = require("./util/aes.js");

module.exports.load = async (cfg_file) => {

      let options = {};
      
      try {
        
        let fixFile = false;
        
        options = ini.parse(await ffs.promises.readFile(cfg_file,"utf8"));
        
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

        if (typeof options.notification.souvenir !== "boolean"){
          options.notification.souvenir = true;
          fixFile = true;
        }

        if (typeof options.notification.showDesc !== "boolean"){
          options.notification.showDesc = false;
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
        
        if (fixFile) await ffs.promises.writeFile(cfg_file,ini.stringify(options),"utf8").catch(()=>{});
        
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
            iconPrefetch: true          
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
        
        await ffs.promises.writeFile(cfg_file,ini.stringify(options),"utf8").catch(()=>{});

      }
      
      return options;
}