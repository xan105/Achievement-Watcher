"use strict";

const os = require('os');
const path = require('path');
const singleInstance = new (require('single-instance'))('Achievement Watchdog');
const getStartApps = require('get-startapps');
const watch = require('node-watch');
const tasklist = require('win-tasklist');
const moment = require("moment");
const toast = require("powertoast");

const processPriority = require("./util/priority.js");
const ffs = require("./util/feverFS.js");
const settings = require('./settings.js');
const monitor = require('./monitor.js');
const steam = require("./steam.js");
const track = require("./track.js");
const screenshot = require("./native/screenshot.js");
const xinput = require("./native/xinput.js");
const gntp = require("./util/gntp.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/notification.log")
});

const cfg_file = {
  option: path.join(process.env['APPDATA'],"Achievement Watcher/cfg","options.ini"),
  userDir: path.join(process.env['APPDATA'],"Achievement Watcher/cfg","userdir.db")
}

var app = { 
  cache : [],
  options : {},
  watcher: [],
  tick: 0,
  toastID: "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
  start: async function() {
   try{
     let self = this;
     self.cache = [];
      
     debug.log("Achievement Watchdog starting ...");
     
     processPriority.set("high priority").then(()=>{
        debug.log("Process priority set to HIGH")
     }).catch((err) => { 
        debug.log("Fail to set process priority to HIGH");
     }); 

     debug.log("Loading Options ...");
     self.options = await settings.load(cfg_file.option);
     debug.log(self.options);
     
     getStartApps.has({id:"GamingOverlay"}).then((hasXboxOverlay) => {

        let win_ver = os.release().split(".");

        if (self.options.notification_advanced.appID && self.options.notification_advanced.appID !== '') {
                self.toastID = self.options.notification_advanced.appID;
        } else if (win_ver[0] == '6' && ( win_ver[1] == '3' || win_ver[1] == '2') ) {
                self.toastID = "microsoft.XboxLIVEGames_8wekyb3d8bbwe!Microsoft.XboxLIVEGames";
        } else if (hasXboxOverlay === true){
                self.toastID = "Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App";
        }
        
        debug.log(`Toast will use "${self.toastID}"`);
         
      }).catch(()=>{});
     
     try {
        self.watcher[0] = watch(cfg_file.option, function(evt, name) {
              if (evt === "update") {
                debug.log("option file change detected -> reloading");
                self.watcher.forEach( (watcher) => watcher.close() );
                self.start();
              } 
        });
     }catch(err){
        debug.log("No option file > settings live reloading disabled");
     }
     
     let i = 1;        
     for (let folder of await monitor.getFolders(cfg_file.userDir)) {
        try{
          if (await ffs.promises.exists(folder.dir,true)) {
            self.watch(i,folder.dir,folder.options);
            i = i+1;
          }
        }catch(err){
          debug.log(err);
        }
     }   
      
    }catch(err){
      throw err;
    }
  },
  watch: function (i, dir, options) {
    let self = this;
    debug.log(`Monitoring ach change in "${dir}" ...`);
    
    self.watcher[i] = watch(dir, {recursive: options.recursive, filter: options.filter}, async function(evt, name) {
      try{

        if (evt !== "update") return;
        
        let filePath = path.parse(name);
        if (!options.file.some(file => file == filePath.base)) return;
        
        debug.log("achievement file change detected");

        if (moment().diff(moment(self.tick)) <= self.options.notification_advanced.tick) throw "Spamming protection is enabled > SKIPPING";
        self.tick = moment().valueOf();
        
        let appID;
        try{
          appID = (options.appid) ? options.appid : filePath.dir.replace(/(\\stats$)|(\\SteamEmu$)/g,"").match(/([0-9]+$)/g)[0];
        }catch(err){
          throw "Unable to find game's appID";
        }
        
        let game = await self.load(appID);
        
        let isRunning = false;
        
        if (options.disableCheckIfProcessIsRunning === true) {
          isRunning = true;
        } else if (self.options.notification_advanced.checkIfProcessIsRunning) {
          isRunning = await tasklist.isProcessRunning(game.binary).catch((err) => {return false});
        } else {
          isRunning = true;
        }

        if (isRunning) {
        
          let achievements = await monitor.parse(name);
          
          if (achievements.length > 0) {
            
            let cache = await track.load(appID);
            
            let j = 0;
            for (let i in achievements) {
          
                    let ach = game.achievement.list.find(achievement => achievement.name === achievements[i].name);
                    let previous = cache.find(achievement => achievement.name === achievements[i].name) || {
                         Achieved : false,
                         CurProgress : 0,
                         MaxProgress : 0,
                         UnlockTime : 0              
                    };

                   if (!previous.Achieved && achievements[i].Achieved) {

                       if (!achievements[i].UnlockTime || achievements[i].UnlockTime == 0) achievements[i].UnlockTime = moment().unix();
                       let elapsedTime = moment().diff(moment.unix(achievements[i].UnlockTime), 'seconds');
                       if (options.disableCheckTimestamp || (elapsedTime >= 0 && elapsedTime <= self.options.notification_advanced.timeTreshold)) {
                          
                          debug.log("Unlocked:"+ ach.displayName);
                          
                          await self.notify({
                             appid: game.appid,
                             title: game.name,
                             id: ach.name,
                             message: ach.displayName,
                             description: ach.description, 
                             icon: ach.icon,
                             time: achievements[i].UnlockTime,
                             delay: j
                          });
                                  
                          j+=1;
                       } else {
                          debug.log("Outatime:"+ ach.displayName)
                       }
                   } else if (previous.Achieved && achievements[i].Achieved){
                   
                      debug.log("Already unlocked:"+ ach.displayName);
                      if (previous.UnlockTime > 0 && previous.UnlockTime != achievements[i].UnlockTime) achievements[i].UnlockTime = previous.UnlockTime;
                      
                   } else if (!achievements[i].Achieved && achievements[i].MaxProgress > 0 && previous.CurProgress < achievements[i].CurProgress ) {
                      
                      debug.log("Progress update:"+ ach.displayName);

                      await self.notifyProgress({
                           appid: game.appid,
                           title: game.name,
                           id: ach.name,
                           message: ach.displayName,
                           description: ach.description, 
                           icon: ach.icongray,
                           progress: {
                            current: achievements[i].CurProgress,
                            max: achievements[i].MaxProgress
                           }
                      });
                      
                   }
          
            }
          
            await track.save(appID,achievements);
          
          }
        }
        else {
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
      
      debug.log(`loading steam schema for ${appID}`);
    
      let search = self.cache.find(game => game.appid == appID);
      let game;  

      if (search) {
        game = search;  
        debug.log("from memory cache");
      } else {
        game = await steam.loadSteamData(appID,self.options.achievement.lang,self.options.steam.apiKey);
        self.cache.push(game); 
        debug.log("from file cache or remote");  
      }
  
      return game;
    
    }catch(err) {
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
              
                 let options = {
                        appID: self.toastID,
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
  },
  notifyProgress: async function (notification = {}){
    try {

      let self = this; 
      
      if (self.options.notification.notifyOnProgress) {
          debug.log(notification);
          
             if (self.options.notification.powershell) {
                  try{

                       let options = {   
                           appID: self.toastID,
                           title: notification.title,
                           icon: notification.icon,
                           attribution: "Progress",
                           onClick: `ach:--appid ${notification.appid} --name '${notification.id}'`,
                           silent: true,
                           progress: {
                              header: notification.message,
                              footer: notification.description,
                              percent: notification.progress.current, 
                           }
                       };
                       
                       if (notification.progress.max != 100) {
                          options.progress.custom = `${notification.progress.current}/${notification.progress.max}`;
                       }

                       await toast(options); 
                       
                  }catch(err){
                       debug.lor(err);
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
                                   message: (self.options.notification.showDesc && notification.description) ? `[ ${notification.progress.current}/${notification.progress.max} ]\n${notification.message}\n${notification.description}` : `[ ${notification.progress.current}/${notification.progress.max} ]\n${notification.message}`, 
                                   icon: notification.icon
                             });
                    } else {
                      debug.log("GNTP endpoint unreachable!");
                    }
                 }).catch((err)=>{debug.log(err)});
            } else{
                 debug.log("GNTP notification is disabled > SKIPPING")
            }    
                      
      }else{
         debug.log("Notification on progress is disabled > SKIPPING");
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