"use strict";

const path = require('path');
const ini = require("ini");
const moment = require("moment");
const watch = require('node-watch');
const toast = require("powertoast");
const tasklist = require('win-tasklist');
const getStartApps = require('get-startapps');
const singleInstance = new (require('single-instance'))('Achievement Watchdog');
const osLocale = require('os-locale');

const screenshot = require("./util/screenshot.js");
const ffs = require("./util/feverFS.js");
const achievement = require("./achievement.js");
const aes = require("./util/aes.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/watchdog.log")
});

const steamLanguages = require("./steamLanguages.json");

const folder = {
  config: path.join(process.env['APPDATA'],"Achievement Watcher/cfg"),
  achievement : [
    path.join(process.env['Public'],"Documents/Steam/CODEX"),
    path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves")
  ]
}

const file = {
  config: path.join(folder.config,"options.ini"),
  userDir: path.join(folder.config,"userdir.db"),
  achievement: ["achievements.ini","Achievements.Bin"]
}

var app = {
  cache : [],
  options : {},
  steamKey : null,
  watcher: [],
  hasXboxOverlay: false,
  tick: 0,
  start: async function() {
    try {
    debug.log("Watchdog Starting ...");

      let self = this;
      self.cache = [];
    
      getStartApps.has({id:"GamingOverlay"}).then((has) => {
        if (has) { 
          self.hasXboxOverlay = true;
          debug.log("Xbox Gamebar found!");
        }
      }).catch(()=>{});
    
      await self.loadOption();
      debug.log(self.options);

      try {
        self.watcher[0] = watch(file.config, function(evt, name) {
              if (evt === "update") {
                debug.log(`file change detected in ${path.parse(name).name}`);
                self.watcher.forEach( (watcher) => watcher.close() );
                self.start();
              } 
        });
      }catch(err){
        debug.log("No option file > settings live reloading disabled");
      }   
      
      let i = 1;        
      for (let dir of folder.achievement) {
        try{
          if (await ffs.promises.exists(dir,true)) {
            self.watch(i,dir);
            i = i+1;
          }
        }catch(err){
          debug.log(err);
        }
      }
      
      try {
        let userDirList = JSON.parse(await ffs.promises.readFile(file.userDir,"utf8"));
        
        for (let dir of userDirList) {
           
           if (dir.notify == true) {

             try {
             let info = ini.parse(await ffs.promises.readFile(path.join(dir.path,"ALI213.ini"),"utf8"));
             dir.path = path.join(dir.path,`Profile/${info.Settings.PlayerName}/Stats/`);
             }catch(err){/*continue*/}
             
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
        debug.log(err);
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
        
        self.options = ini.parse(await ffs.promises.readFile(file.config,"utf8"));
        
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
        
        if (typeof self.options.achievement.hideZero !== "boolean"){
          self.options.achievement.hideZero = false;
          fixFile = true;
        }
        
        if (typeof self.options.achievement.notification !== "boolean"){
          self.options.achievement.notification = true;
          fixFile = true;
        }
        
        if (self.options.achievement.legitSteam != 0 && self.options.achievement.legitSteam != 1 && self.options.achievement.legitSteam != 2){
          self.options.achievement.legitSteam = 0;
          fixFile = true;
        }
        
        if (typeof self.options.achievement.souvenir !== "boolean"){
          self.options.achievement.souvenir = true;
          fixFile = true;
        }
        
        if (isNaN(self.options.notifier.timeTreshold)){
          self.options.notifier.timeTreshold = 5;
          fixFile = true;
        }
        
        if (isNaN(self.options.notifier.tick)){
          self.options.notifier.tick = 600;
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
        
        if (fixFile) await ffs.promises.writeFile(file.config,ini.stringify(self.options),"utf8").catch(()=>{});

      }catch(err){
      
        debug.log(err);
      
        self.options = {
          achievement: {
            showHidden: false,
            mergeDuplicate: true,
            notification: true,
            legitSteam: 0,
            souvenir: true
          },
          notifier: {
            timeTreshold: 5,
            tick: 600,
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
        
        await ffs.promises.writeFile(file.config,ini.stringify(self.options),"utf8").catch(()=>{});

      }
  },
  watch : function (i,dir){
    
    let self = this;
    
    debug.log(`Monitoring ach change in "${dir}" ...`);
    
    self.watcher[i] = watch(dir, { recursive: true, filter: /([0-9]+)/ }, async function(evt, name) {
    try {
        
        if (evt !== "update") return;
        
        let filePath = path.parse(name);
        
        if (!file.achievement.some(file => file == filePath.base) || !await ffs.promises.isYoungerThan(name, {timeUnit:'seconds',time:10})) return;
        
        debug.log("ach file change detected");
        
        if (moment().diff(moment(self.tick)) <= self.options.notifier.tick) throw "Spamming protection is enabled > SKIPPING";
        self.tick = moment().valueOf();
        
        let appID = filePath.dir.match(/([0-9]+$)/g)[0];
        
        let game = await self.load(appID);
        
        let isRunning = (self.options.notifier.checkIfProcessIsRunning) ? await tasklist.isProcessRunning(game.binary).catch((err)=>{return false}) : true;
        
        if (isRunning) {
          
          let localAchievements = await self.parse(name);
          
          if (localAchievements.length > 0) {
          
            if (typeof localAchievements[0].Achieved !== "boolean") throw "Achieved Value is not a boolean";
            if (!localAchievements[0].UnlockTime) throw "Unvalid timestamp";
            let elapsedTime = moment().diff(moment.unix(localAchievements[0].UnlockTime), 'seconds');
              
              if (localAchievements[0].Achieved &&  elapsedTime >= 0 && elapsedTime <= self.options.notifier.timeTreshold) {
              
                  let ach = game.achievement.list.find(achievement => achievement.name === localAchievements[0].name);
                  
                  debug.log("Unlocked: "+ach.displayName);
                  
                    await self.notify({
                      appid: game.appid,
                      title: game.name,
                      id: ach.name,
                      message: ach.displayName,
                      icon: ach.icon
                    });
                  
                  if(self.options.achievement.souvenir) await screenshot(game.name,ach.displayName).catch((err)=>{debug.log(err)});
                  
                  for (let i in localAchievements) { 

                    if ( i > 0) {
                      if (localAchievements[i].Achieved) {
                        if (localAchievements[i].UnlockTime === localAchievements[0].UnlockTime) {
                            let ach = game.achievement.list.find(achievement => achievement.name === localAchievements[i].name);
                            
                            debug.log("Unlocked (at the same time): "+ach.displayName);

                              await self.notify({
                                appid: game.appid,
                                title: game.name,
                                id: ach.name,
                                message: ach.displayName,
                                icon: ach.icon
                              });

                            if(self.options.achievement.souvenir) await screenshot(game.name,ach.displayName).catch((err)=>{debug.log(err)});
                            
                        }
                      }
                    }
                  }
              
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
  
      debug.log(`loading steam schema for ${appID}`);
      
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
                      Achieved : (local[achievement].Achieved == 1 || local[achievement].HaveAchieved == 1) ? true : false,
                      CurProgress : local[achievement].CurProgress || 0,
                      MaxProgress : local[achievement].MaxProgress || 0,
                      UnlockTime : local[achievement].UnlockTime || local[achievement].HaveAchievedTime || 0
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
  notify : async function (notification = {}){
  
      try {
    
         let self = this;

         if (self.options.achievement.notification) {
           debug.log(notification);

           await toast({
                  appID: (self.options.notifier.appID && self.options.notifier.appID !== '') ? self.options.notifier.appID : (self.hasXboxOverlay === true) ? "Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App" : "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
                  title: notification.title,
                  message: notification.message,
                  icon: notification.icon,
                  attribution: "Achievement",
                  onClick: `ach:--appid ${notification.appid} --name '${notification.id}'`
           });
         } else {
           debug.log("Notification is disabled > SKIPPING");
         }   

    }catch(err){
      debug.log("Fail to invoke toast notification");
      throw err;
    }
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