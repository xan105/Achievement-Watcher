"use strict";

const os = require('os');
const path = require('path');
const ini = require("ini");
const moment = require("moment");
const watch = require('node-watch');
const toast = require("powertoast");
const tasklist = require('win-tasklist');
const getStartApps = require('get-startapps');
const singleInstance = new (require('single-instance'))('Achievement Watchdog');
const osLocale = require('os-locale');
const parentFind = require('find-up');
const track = require("./track.js");
const regedit = require("./native/regedit.js");
const screenshot = require("./native/screenshot.js");
const xinput = require("./native/xinput.js");
const ffs = require("./util/feverFS.js");
const achievement = require("./achievement.js");
const aes = require("./util/aes.js");
const gntp = require("./util/gntp.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/watchdog.log")
});

const steamLanguages = require("./steamLanguages.json");

const mydocs = regedit.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","Personal");
const folder = {
  config: path.join(process.env['APPDATA'],"Achievement Watcher/cfg"),
  achievement : [
    path.join(process.env['Public'],"Documents/Steam/CODEX"),
    path.join(process.env['APPDATA'],"Goldberg SteamEmu Saves"),
    path.join(process.env['PROGRAMDATA'],"Steam"),
    path.join(mydocs,"HLM"),
    path.join(mydocs,"DARKSiDERS")
  ]
}

const file = {
  config: path.join(folder.config,"options.ini"),
  userDir: path.join(folder.config,"userdir.db"),
  achievement: ["achievements.ini","Achievements.Bin","stats.ini"]
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

             try{
             
              let info;
              for (let file of ["ALI213.ini", "valve.ini", "hlm.ini", "ds.ini", "steam_api.ini"]) {
                  try{
                    info = ini.parse(await ffs.promises.readFile(path.join(dir.path,file),"utf8"));
                  break;
                  }catch(e){}
              }
              if(info) {
              
                  if (info.Settings && info.Option) { //ALI213
                      if(info.Settings.AppID && info.Settings.PlayerName) {
                          let dirpath = await parentFind(async (directory) => {
                                            let has = await parentFind.exists(path.join(directory, `Profile/${info.Settings.PlayerName}/Stats/`, 'Achievements.Bin'));
                                            return has && directory;
                             }, {cwd: dir.path, type: 'directory'});

                          if (dirpath){
                              dir.path = path.join(dirpath,`Profile/${info.Settings.PlayerName}/Stats`);
                              dir.appid = info.Settings.AppID;                 
                          }    
                    }
                  } else if (info.GameSettings) { //Hoodlum - DARKSiDERS
                      if(info.GameSettings.UserDataFolder === "." && info.GameSettings.AppId) {

                          let dirpath = await parentFind(async (directory) => {
                                          let has = await parentFind.exists(path.join(directory, 'SteamEmu','stats.ini'));
                                          return has && directory;
                                    }, {cwd: dir.path, type: 'directory'});

                          if (dirpath){
                              dir.path = path.join(dirpath,"SteamEmu");
                              dir.appid = info.GameSettings.AppId;
                          } 
                  
                      }
                  } else if (info.Settings) { //Catherine
                      if (info.Settings.AppId && info.Settings.SteamID) {

                              let dirpath = await parentFind(async (directory) => {
                                              let has = await parentFind.exists(path.join(directory, `SteamProfile/${info.Settings.SteamID}`,'Achievements.ini'));
                                              return has && directory;
                                        }, {cwd: dir.path, type: 'directory'});

                              if (dirpath){
                                  dir.path = path.join(dirpath,`SteamProfile/${info.Settings.SteamID}`);
                                  dir.appid = info.Settings.AppId;
                              } 
                      
                      }

                  }
                    
              }           
             }catch(e){}
             
             if (await ffs.promises.exists(dir.path,true)) {
                    try {
                      if (dir.appid) {
                        self.watch(i,dir.path,dir.appid);
                      } else {
                        self.watch(i,dir.path);
                      }
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
        
        if (typeof self.options.achievement.timeMergeRecentFirst !== "boolean"){
          self.options.achievement.timeMergeRecentFirst = true;
          fixFile = true;
        }
        
        if (typeof self.options.achievement.hideZero !== "boolean"){
          self.options.achievement.hideZero = false;
          fixFile = true;
        }
        
        if (self.options.achievement.legitSteam != 0 && self.options.achievement.legitSteam != 1 && self.options.achievement.legitSteam != 2){
          self.options.achievement.legitSteam = 0;
          fixFile = true;
        }
             
        if (typeof self.options.notification.notify !== "boolean"){
          self.options.notification.notify = true;
          fixFile = true;
        }
  
        if (typeof self.options.notification.powershell !== "boolean"){
          self.options.notification.powershell = true;
          fixFile = true;
        }
        
        if (typeof self.options.notification.gntp !== "boolean"){
          self.options.notification.gntp = true;
          fixFile = true;
        }
        
        if (typeof self.options.notification.souvenir !== "boolean"){
          self.options.notification.souvenir = true;
          fixFile = true;
        }
        
        if (self.options.notification.toastSouvenir!= 0 && self.options.notification.toastSouvenir != 1 && self.options.notification.toastSouvenir != 2){
          self.options.notification.toastSouvenir = 0;
          fixFile = true;
        }
        
        if (typeof self.options.notification.souvenir !== "boolean"){
          self.options.notification.showDesc = false;
          fixFile = true;
        }
        
        if (self.options.notification.customToastAudio != 0 && self.options.notification.customToastAudio != 1 && self.options.notification.customToastAudio != 2){
          self.options.notification.customToastAudio = 1;
          fixFile = true;
        }
        
        if (typeof self.options.notification.rumble !== "boolean"){
          self.options.notification.rumble = true;
          fixFile = true;
        }
        
        if (isNaN(self.options.notification_advanced.timeTreshold)){
          self.options.notification_advanced.timeTreshold = 5;
          fixFile = true;
        }
        
        if (isNaN(self.options.notification_advanced.tick)){
          self.options.notification_advanced.tick = 600;
          fixFile = true;
        }
        
        if (typeof self.options.notification_advanced.checkIfProcessIsRunning !== "boolean"){
          self.options.notification_advanced.checkIfProcessIsRunning = true;
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
  watch : function (i,dir, _appid = null){
    
    let self = this;
    
    debug.log(`Monitoring ach change in "${dir}" ...`);
    
    let options = { recursive: true, filter: /([0-9]+)/ };
    
    if (_appid) options = { recursive: false };
    
    self.watcher[i] = watch(dir, options, async function(evt, name) {
    try {
        
        if (evt !== "update") return;
        
        let filePath = path.parse(name);
        
        if (!file.achievement.some(file => file == filePath.base) || !await ffs.promises.isYoungerThan(name, {timeUnit:'seconds',time:10})) return;
        
        debug.log("ach file change detected");
        
        if (moment().diff(moment(self.tick)) <= self.options.notification_advanced.tick) throw "Spamming protection is enabled > SKIPPING";
        self.tick = moment().valueOf();
        
        let appID = _appid || filePath.dir.replace(/(\\stats$)|(\\SteamEmu$)/g,"").match(/([0-9]+$)/g)[0];
        
        let game = await self.load(appID);
        
        let isRunning = (self.options.notification_advanced.checkIfProcessIsRunning) ? await tasklist.isProcessRunning(game.binary).catch((err)=>{return false}) : true;
        
        if (isRunning) {
          
          let localAchievements = await self.parse(name);
          
          if (localAchievements.length > 0) {
          
            if (typeof localAchievements[0].Achieved !== "boolean") throw "Achieved Value is not a boolean";
            if (!localAchievements[0].UnlockTime) throw "Unvalid timestamp";
            let elapsedTime = moment().diff(moment.unix(localAchievements[0].UnlockTime), 'seconds');
              
              if (localAchievements[0].Achieved &&  elapsedTime >= 0 && elapsedTime <= self.options.notification_advanced.timeTreshold) {
              
                  let ach = game.achievement.list.find(achievement => achievement.name === localAchievements[0].name);
 
                  if ( await track.isAlreadyUnlocked(appID,localAchievements[0].name) ) {
                    debug.log("already unlocked");
                  } else {
                    debug.log("Unlocked: "+ach.displayName);
                    
                      await self.notify({
                        appid: game.appid,
                        title: game.name,
                        id: ach.name,
                        message: ach.displayName,
                        description: ach.description, 
                        icon: ach.icon,
                        time: localAchievements[0].UnlockTime
                      });
                      
                      await track.keep(appID,localAchievements[0].name,localAchievements[0].UnlockTime);

                  }

                  let j = 0;
                  for (let i in localAchievements) { 

                    if ( i > 0) {
                      if (localAchievements[i].Achieved) {
                        if (localAchievements[i].UnlockTime === localAchievements[0].UnlockTime) {
                        
                            let ach = game.achievement.list.find(achievement => achievement.name === localAchievements[i].name);
                            
                            if ( await track.isAlreadyUnlocked(appID,localAchievements[i].name) ) {
                              debug.log("already unlocked");
                            } else {
                              debug.log("Unlocked (at the same time): "+ach.displayName);

                              j+=1;

                              await self.notify({
                                    appid: game.appid,
                                    title: game.name,
                                    id: ach.name,
                                    message: ach.displayName,
                                    description: ach.description, 
                                    icon: ach.icon,
                                    time: localAchievements[i].UnlockTime,
                                    delay: j
                              });
                                  
                              await track.keep(appID,localAchievements[i].name,localAchievements[i].UnlockTime);

                            }
                            
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
      
      if (local.AchievementsUnlockTimes && local.Achievements) { //hoodlum
        let convert = {};
        for (let i in local.Achievements) {
            if (local.Achievements[i] == 1) {
              convert[`${i}`] = { Achieved: "1", UnlockTime: local.AchievementsUnlockTimes[i] || null };
            }
        }
        local = convert;
      }
      
      let achievements = [];

      for (let achievement in local){

            if (achievement !== "SteamAchievements" && achievement !== "Steam" && achievement !== "Steam64") {
                try {
                  
                  if(local[achievement].State) { //RLD!
                              //uint32 little endian
                              local[achievement].State = new DataView(new Uint8Array(Buffer.from(local[achievement].State.toString(),'hex')).buffer).getUint32(0, true);
                              local[achievement].CurProgress = new DataView(new Uint8Array(Buffer.from(local[achievement].CurProgress.toString(),'hex')).buffer).getUint32(0, true);
                              local[achievement].MaxProgress = new DataView(new Uint8Array(Buffer.from(local[achievement].MaxProgress.toString(),'hex')).buffer).getUint32(0, true); 
                              local[achievement].Time = new DataView(new Uint8Array(Buffer.from(local[achievement].Time.toString(),'hex')).buffer).getUint32(0, true);  
                  }                  

                  let result = {
                      name: achievement,
                      Achieved : (local[achievement].Achieved == 1 || local[achievement].HaveAchieved == 1 || local[achievement].State == 1 || local[achievement].Unlocked == 1) ? true : false,
                      CurProgress : local[achievement].CurProgress || 0,
                      MaxProgress : local[achievement].MaxProgress || 0,
                      UnlockTime : local[achievement].UnlockTime || local[achievement].HaveAchievedTime || local[achievement].Time || 0
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

         let souvenir;
         if(self.options.notification.souvenir) {
          try {
            souvenir = await screenshot(notification.title,notification.message);
          }catch(err){
            debug.log(err);
          }
         }

         if (self.options.notification.notify) {
           debug.log(notification);

            if (self.options.notification.powershell) {
              try{
                 let win_ver = os.release().split(".");
                 let appID = "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp";
                  
                 if (self.options.notification_advanced.appID && self.options.notification_advanced.appID !== '') {
                    appID = self.options.notification_advanced.appID;
                 } else if (win_ver[0] == '6' && ( win_ver[1] == '3' || win_ver[1] == '2') ) {
                    appID = "microsoft.XboxLIVEGames_8wekyb3d8bbwe!Microsoft.XboxLIVEGames";
                 } else if (self.hasXboxOverlay === true){
                    appID = "Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App";
                 }
                 
                 debug.log(`Using ${appID}`);

                 let options = {
                        appID: appID,
                        timeStamp: notification.time,
                        title: notification.title,
                        message: (self.options.notification.showDesc && notification.description) ? `${notification.message}\n${notification.description}` : `${notification.message}`,
                        icon: notification.icon,
                        attribution: "Achievement",
                        onClick: `ach:--appid ${notification.appid} --name '${notification.id}'`,
                        silent: (self.options.notification.customToastAudio == 0) ? true : false,
                        audio: (self.options.notification.customToastAudio == 2) ? "ms-winsoundevent:Notification.Achievement" : null               
                 };
                 
                 if (self.options.notification.souvenir && self.options.notification.toastSouvenir > 0 && souvenir) {
                    if (self.options.notification.toastSouvenir == 1) {
                      options.headerImg = souvenir;
                    } else if (self.options.notification.toastSouvenir == 2) {
                      options.footerImg = souvenir;
                    }
                 }

                 await toast(options);            

              }catch(err){
                debug.log(err);
                debug.log("Fail to invoke toast notification");
              }
           
           } else {
            debug.log("Powershell toast notification is disabled > SKIPPING")
           }
           
           if (self.options.notification.gntp) {
               gntp.hasGrowl().then((has)=>{
                  if (has) {
                    debug.log("Sending GNTP Grrr!");
                    return gntp.send({
                                 title: notification.title, 
                                 message: (self.options.notification.showDesc && notification.description) ? `${notification.message}\n${notification.description}` : `${notification.message}`, 
                                 icon: notification.icon
                           });
                  } else {
                    debug.log("GNTP endpoint unreachable!");
                  }
               }).catch((err)=>{debug.log(err)});
           } else{
            debug.log("GNTP notification is disabled > SKIPPING")
           }
           
           if(self.options.notification.rumble){
               if (!self.options.notification.powershell) notification.delay = 0;
              
               setTimeout(function(){  
                    xinput.vibrate({duration: 1}).catch(()=>{});
               }, 7000 * notification.delay || 0);
            }

         } else {
           debug.log("Notification is disabled > SKIPPING");
         }   

    }catch(err){
      debug.log(err);
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