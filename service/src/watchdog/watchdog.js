"use strict";

const path = require('path');
const ini = require("ini");
const moment = require("moment");
const watch = require('node-watch');
const toast = require("powertoast");
const tasklist = require('win-tasklist');
const singleInstance = new (require('single-instance'))('Achievement Watchdog');
const osLocale = require('os-locale');

const ffs = require("./util/feverFS.js");
const achievement = require("./achievement.js");
const aes = require("./util/aes.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/watchdog.log")
});

const steamLanguages = require("./steamLanguages.json");

const dir = {
  achievement : path.join(process.env['Public'],"Documents/Steam/CODEX"),
  config: path.join(process.env['APPDATA'],"Achievement Watcher/cfg")
}

const filename = path.join(dir.config,"options.ini");
const userDirListFile = path.join(dir.config,"userdir.json");

var app = {
  cache : [],
  options : {},
  steamKey : null,
  watcher: [],
  start: async function() {
    try {
    debug.log("Watchdog Starting ...");

      let self = this;
      self.cache = [];
    
      await self.loadOption();
      
      debug.log(self.options);
      
      try {
        self.watcher[0] = watch(filename, function(evt, name) {
              if (evt === "update") {
                debug.log("Option file change detected");
                self.watcher.forEach( (watcher) => watcher.close() );
                self.start();
              } 
        });
      }catch(err){
        debug.log("No option file > settings live reloading disabled");
      }

      let i = 1;
      try{
        self.watch(i,dir.achievement);
        i = i+1;
      }catch(err){
        debug.log(err);
      }
      
      try {
        let userDirList = JSON.parse(await ffs.promises.readFile(userDirListFile,"utf8"));
        
        for (let dir of userDirList) {
           
           if (dir.notify == true) {

             if (await ffs.promises.exists(dir.path,true)) {
                try {
                  self.watch(i,dir.path);
                  i = i+1;
                }catch(err){
                  debug.log(err);
                }
             }
           }  
        }
        
      }catch(err){
        //Do Nothing
        console.error(err);
      }     

    }catch(err) {
      debug.log(err);
    }
  },
  loadOption : async function(){
      
      debug.log("Watchdog Loading Options ...");
      
      let self = this;

      try {
        
        let fixFile = false;
        
        self.options = ini.parse(await ffs.promises.readFile(filename,"utf8"));
        
        if (!steamLanguages.some(lang => lang.api == self.options.achievement.lang)) {
        
          try {
            let locale = await osLocale();
            locale = locale.replace("_","-");
            
            let lang = steamLanguages.find(lang => lang.webapi == locale);
            if (!lang) {
              lang = steamLanguages.find(lang => lang.webapi.startsWith(locale.slice(0,2)));
            }
            
            self.options.achievement.lang = lang.api
            debug.log("defaulting to user locale");
          }catch(err){
            self.options.achievement.lang = "english";
            debug.log("defaulting to english");
          }
          fixFile = true;  
        }
        
        if (typeof self.options.achievement.showHidden !== "boolean"){
          self.options.achievement.showHidden = false;
          fixFile = true;
        }
        
        if (typeof self.options.achievement.mergeDuplicate !== "boolean"){
          self.options.achievement.mergeDuplicate = true;
          fixFile = true;
        }
        
        if (typeof self.options.achievement.notification !== "boolean"){
          self.options.achievement.notification = true;
          fixFile = true;
        }
        
        if (isNaN(self.options.notifier.timeTreshold)){
          self.options.notifier.timeTreshold = 30;
          fixFile = true;
        }
        
        if (typeof self.options.notifier.checkIfProcessIsRunning !== "boolean"){
          self.options.notifier.checkIfProcessIsRunning = true;
          fixFile = true;
        }
        
        if (self.options.steam) {
          if (self.options.steam.apiKey){
            if (self.options.steam.apiKey.includes(":")) {
              self.steamKey = aes.decrypt(self.options.steam.apiKey);
            } else {
              fixFile = true;
            }
          } 
        } else {
          self.options.steam = {};
        }
        
        if (fixFile) await ffs.promises.writeFile(filename,ini.stringify(self.options),"utf8").catch(()=>{});

      }catch(err){
      
        debug.log(err);
      
        self.options = {
          achievement: {
            showHidden: false,
            mergeDuplicate: true,
            notification: true
          },
          notifier: {
            timeTreshold: 30,
            checkIfProcessIsRunning: true
          },
          steam: {}
        };

        try {
          let locale = await osLocale();
          locale = locale.replace("_","-");
          
          let lang = steamLanguages.find(lang => lang.webapi == locale);
          if (!lang) {
            lang = steamLanguages.find(lang => lang.webapi.startsWith(locale.slice(0,2)));
          }
          
          self.options.achievement.lang = lang.api
        }catch(err){
          self.options.achievement.lang = "english";
        }
        
        await ffs.promises.writeFile(filename,ini.stringify(self.options),"utf8").catch(()=>{});

      }
  },
  watch : function (i,dir){
    
    let self = this;
    
    debug.log(`Monitoring ach change in "${dir}" ...`);
    
    self.watcher[i] = watch(dir, { recursive: true, filter: /([0-9]*)+\\+achievements.ini/ }, async function(evt, name) {
    try {

       if (!self.options.achievement.notification || evt !== "update" || !await ffs.promises.isYoungerThan(name, {timeUnit:'seconds',time:10})) return;

       debug.log("ach file change detected");
        
        let appID = path.parse(name).dir.match(/([0-9])\w+/g)[0];
        
        let game = await self.load(appID);
        
        let isRunning;
        if (self.options.notifier.checkIfProcessIsRunning) {
          isRunning = await tasklist.isProcessRunning(game.binary).catch((err)=>{return false});
        } else {
          isRunning = true;
        }
        
        if (isRunning) {
          
          let localAchievements = await self.parse(name);
          
          if (localAchievements.length > 0) {
          
            let elapsedTime = moment().diff(moment.unix(localAchievements[0].UnlockTime), 'seconds');
            
            if (localAchievements[0].Achieved &&  elapsedTime >= 0 && elapsedTime <= self.options.notifier.timeTreshold) {
            
                let ach = game.achievement.list.find(achievement => achievement.name === localAchievements[0].name);
                
                debug.log("Unlocked: "+ach.displayName);
                
                self.notify({
                  appid: game.appid,
                  title: game.name,
                  message: ach.displayName,
                  icon: ach.icon
                });
            
            } else {
              debug.log("already unlocked");
            }
          
          }
        
        } else {
          debug.log("binary not running");
        }
      }catch(err){
        debug.log(err);
      }
    });

  },
  load : async function(appID){
  
    try {
  
      let self = this;
    
      let search = self.cache.find(game => game.appid == appID);
      let game;  

      if (search) {
        game = search;  
        debug.log("from memory cache");
      } else {
        game = await achievement.loadSteamData(appID,self.options.achievement.lang,self.steamKey);
        self.cache.push(game); 
        debug.log("from file cache or remote");  
      }
  
      return game;
    
    }catch(err) {
      debug.log(err);
      throw err;
    }
  
  },
  parse: async function(filename){
  
    try {
  
      let local = ini.parse(await ffs.promises.readFile(filename,"utf8"));
      
      let achievements = [];

      for (let achievement in local){

            if (achievement !== "SteamAchievements") {
                try {
                  let result = {
                      name: achievement,
                      Achieved : (local[achievement].Achieved == 1) ? true : false,
                      CurProgress : local[achievement].CurProgress || 0,
                      MaxProgress : local[achievement].MaxProgress || 0,
                      UnlockTime : local[achievement].UnlockTime || 0
                  };
                  achievements.push(result);
                }catch(e){}
            }
      }

      achievements.sort((a,b) => {
        return b.UnlockTime - a.UnlockTime;
      });
      
      return achievements;
      
    }catch(err)
    {
      debug.log(err);
      throw err;
    }
  
  },
  notify : function (notification = {}){

     toast({
            appID: self.options.notifier.appID || "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
            title: notification.title,
            message: notification.message,
            icon: notification.icon,
            attribution: "Achievement",
            onClick: `ach:${notification.appid}`
     }).catch((err) => { 
        debug.log(err)
     });

  }

}

singleInstance.lock().then(() => {
  app.start().catch((err) => { 
    debug.log(err); 
  });
})
.catch((err) => {
  debug.log(err);
  process.exit();
});