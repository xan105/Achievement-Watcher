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
              
              let lang = steamLang.find(lang => lang.webapi == locale);
              if (!lang) {
                lang = steamLang.find(lang => lang.webapi.startsWith(locale.slice(0,2)));
              }
              
              options.achievement.lang = lang.api
            
           }catch(err){
              options.achievement.lang = "english";
           } 
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
        
        if (options.achievement.legitSteam != 0 && options.achievement.legitSteam != 1 && options.achievement.legitSteam != 2){
          options.achievement.legitSteam = 0;
          fixFile = true;
        }
             
        if (typeof options.notification.notify !== "boolean"){
          options.notification.notify = true;
          fixFile = true;
        }
  
        if (typeof options.notification.powershell !== "boolean"){
          options.notification.powershell = true;
          fixFile = true;
        }
        
        if (typeof options.notification.gntp !== "boolean"){
          options.notification.gntp = true;
          fixFile = true;
        }
        
        if (typeof options.notification.souvenir !== "boolean"){
          options.notification.souvenir = true;
          fixFile = true;
        }
        
        if (options.notification.toastSouvenir!= 0 && options.notification.toastSouvenir != 1 && options.notification.toastSouvenir != 2){
          options.notification.toastSouvenir = 0;
          fixFile = true;
        }
        
        if (typeof options.notification.souvenir !== "boolean"){
          options.notification.showDesc = false;
          fixFile = true;
        }
        
        if (options.notification.customToastAudio != 0 && options.notification.customToastAudio != 1 && options.notification.customToastAudio != 2){
          options.notification.customToastAudio = 1;
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
            showHidden: false,
            mergeDuplicate: true,
            timeMergeRecentFirst: false,
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
            rumble: true,
            notifyOnProgress: true         
          },
          notification_advanced: {
            timeTreshold: 10,
            tick: 600,
            checkIfProcessIsRunning: true
          },
          steam: {}
        };

        try {
          let locale = await osLocale();
          locale = locale.replace("_","-");
          
          let lang = steamLang.find(lang => lang.webapi == locale);
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