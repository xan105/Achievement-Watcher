"use strict";

const instance = new (require('single-instance'))('Achievement Watchdog');
const os = require('os');
const path = require('path');
const getStartApps = require('get-startapps');
const watch = require('node-watch');
const tasklist = require('win-tasklist');
const moment = require("moment");
const websocket = require("./websocket.js");
const processPriority = require("./util/priority.js");
const fs = require("@xan105/fs");
const settings = require('./settings.js');
const monitor = require('./monitor.js');
const steam = require("./steam.js");
const track = require("./track.js");
const playtimeMonitor = require("./playtime/monitor.js");
const notify = require("./notification/toaster.js");
const debug = require("./util/log.js");
const { crc32 } = require('crc');
const { isWinRTAvailable } = require('powertoast');

const cfg_file = {
  option: path.join(process.env['APPDATA'],"Achievement Watcher/cfg","options.ini"),
  userDir: path.join(process.env['APPDATA'],"Achievement Watcher/cfg","userdir.db")
}

var app = { 
  isRecording: false,
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
        debug.error("Fail to set process priority to HIGH");
     }); 

     debug.log("Loading Options ...");
     self.options = await settings.load(cfg_file.option);
     debug.log(self.options);
     
     if (isWinRTAvailable() === true && self.options.notification_transport.winRT === true) debug.log("[Toast] will use WinRT");
     else debug.warn("[Toast] will use PowerShell");
     
     getStartApps.has({id:"GamingOverlay"}).then((hasXboxOverlay) => {

        let win_ver = os.release().split(".");

        if (self.options.notification_advanced.appID && self.options.notification_advanced.appID !== '') {
                self.toastID = self.options.notification_advanced.appID;
        } else if (win_ver[0] == '6' && ( win_ver[1] == '3' || win_ver[1] == '2') ) {
                self.toastID = "microsoft.XboxLIVEGames_8wekyb3d8bbwe!Microsoft.XboxLIVEGames";
        } else if (hasXboxOverlay === true){
                self.toastID = "Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App";
        }

        debug.log(`[Toast] will use appid: "${self.toastID}"`);
         
      })
      .then(()=>{ return getStartApps.isValidAUMID(self.toastID)})
      .then((res)=>{ 
      
		if(!res){ 
			debug.warn("[Toast] which is not a valid AUMID !");
			if(!self.options.notification_advanced.iconPrefetch) {
				self.options.notification_advanced.iconPrefetch = true;
				debug.warn("[Toast] Forcing iconPrefetch to true so you will have achievement icon");
			}
        } else {
			debug.log("[Toast] which is a valid AUMID");
        }
      
      })
      .catch(()=>{});

     try {
        self.watcher[0] = watch(cfg_file.option, function(evt, name) {
              if (evt === "update") {
                debug.log("option file change detected -> reloading");
                self.watcher.forEach( (watcher) => watcher.close() );
                self.start();
              } 
        });
     }catch(err){
        debug.warn("No option file > settings live reloading disabled");
     }
     
     let i = 1;        
     for (let folder of await monitor.getFolders(cfg_file.userDir)) {
        try{
          if (await fs.exists(folder.dir)) {
            self.watch(i,folder.dir,folder.options);
            i = i+1;
          }
        }catch(err){
          debug.log(err);
        }
     } 
      
    }catch(err){
      debug.error(err);
      instance.unlock();
      process.exit();
    }
  },
  watch: function (i, dir, options) {
    let self = this;
    debug.log(`Monitoring ach change in "${dir}" ...`);
    
    self.watcher[i] = watch(dir, {recursive: options.recursive, filter: options.filter}, async function(evt, name) {
      try{

        if (evt !== "update") return;
        
        const currentTime = Date.now();
		const fileLastModified = (await fs.stats(name)).mtimeMs || 0;
		if ( (currentTime - fileLastModified) > 1000) return;
        
        let filePath = path.parse(name);
        if (!options.file.some(file => file == filePath.base)) return;
        
        debug.log("achievement file change detected");

        if (moment().diff(moment(self.tick)) <= self.options.notification_advanced.tick) throw "Spamming protection is enabled > SKIPPING";
        self.tick = moment().valueOf();
        
        let appID;
        try{
          appID = (options.appid) ? options.appid : filePath.dir.replace(/(\\stats$)|(\\SteamEmu$)|(\\SteamEmu\\UserStats$)/g,"").match(/([0-9]+$)/g)[0];
        }catch(err){
          throw "Unable to find game's appID";
        }
        
        let game = await self.load(appID);
        
        let isRunning = false;
        
        if (options.disableCheckIfProcessIsRunning === true) {
          isRunning = true;
        } else if (self.options.notification_advanced.checkIfProcessIsRunning) {
          if (game.binary) {
            isRunning = await tasklist.isProcessRunning(game.binary).catch((err) => {
              debug.error(err);
              debug.warn("Assuming process is NOT running");
              return false
            });
          } else {
            debug.warn(`Warning! Missing "${game.name}" (${game.appid}) binary name > Overriding user choice to check if process is running`);
            isRunning = true;
          }
        } else {
          isRunning = true;
        }

        if (isRunning) {
        
          let achievements = await monitor.parse(name);
          
          if (achievements.length > 0) {
            
            let cache = await track.load(appID);
            
            let j = 0;
            for (let i in achievements) {
                    try{

                        let ach = game.achievement.list.find( (achievement ) => { 
                              if (achievements[i].crc) {
                                return achievements[i].crc.includes(crc32(achievement.name).toString(16)); //(SSE) crc module removes leading 0 when dealing with anything below 0x1000 -.-'
                              } else {
                                return achievement.name == achievements[i].name || achievement.name.toUpperCase() == achievements[i].name.toUpperCase() //uppercase == uppercase : cdx xcom chimera (apiname doesn't match case with steam schema)
                              }
                        });
                        if (!ach) throw "ACH_NOT_FOUND_IN_SCHEMA";
                       
                        if(achievements[i].crc) {
                          achievements[i].name = ach.name;
                          delete achievements[i].crc;
                        }
                       
                        let previous = cache.find(achievement => achievement.name === ach.name) || {
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
                              
								  await notify({
									 appid: game.appid,
									 gameDisplayName: game.name,
									 achievementName: ach.name,
									 achievementDisplayName: ach.displayName,
									 achievementDescription: ach.description, 
									 icon: ach.icon,
									 time: achievements[i].UnlockTime,
									 delay: j
								  },{
									notify: self.options.notification.notify,
									transport: {
									  toast: self.options.notification_transport.toast,
									  gntp: self.options.notification_transport.gntp,
									  websocket: self.options.notification_transport.websocket
									},
									toast: {
									  appid: self.toastID,
									  winrt: self.options.notification_transport.winRT,
									  balloonFallback: self.options.notification_transport.balloon,
									  customAudio: self.options.notification_toast.customToastAudio,
									  imageIntegration: self.options.notification_toast.toastSouvenir,
									  group: self.options.notification_toast.groupToast,
									  attribution: "Achievement"
									},
									prefetch: self.options.notification_advanced.iconPrefetch,
									souvenir: {
										screenshot: self.options.souvenir_screenshot.screenshot,
										video: self.options.souvenir_video.video,
										screenshot_options: self.options.souvenir_screenshot,
										video_options: self.options.souvenir_video
									},
									rumble: self.options.notification.rumble
								  });
                                      
                              j+=1;
                           } else {
                              debug.warn("Outatime:"+ ach.displayName)
                           }
                       } else if (previous.Achieved && achievements[i].Achieved){
                       
                          debug.log("Already unlocked:"+ ach.displayName);
                          if (previous.UnlockTime > 0 && previous.UnlockTime != achievements[i].UnlockTime) achievements[i].UnlockTime = previous.UnlockTime;
                          
                       } else if (!achievements[i].Achieved && achievements[i].MaxProgress > 0 && +previous.CurProgress < +achievements[i].CurProgress ) {
                          
                          debug.log("Progress update:"+ ach.displayName);
                          
                              await notify({
                                 appid: game.appid,
                                 gameDisplayName: game.name,
                                 achievementName: ach.name,
                                 achievementDisplayName: ach.displayName,
                                 achievementDescription: ach.description, 
                                 icon: ach.icongray,
                                 progress: {
									current: achievements[i].CurProgress,
									max: achievements[i].MaxProgress
                                 }
                              },{
								notify: self.options.notification.notify,
								transport: {
								  toast: self.options.notification_transport.toast,
								  gntp: self.options.notification_transport.gntp,
							      websocket: self.options.notification_transport.websocket
								},
								toast: {
								  appid: self.toastID,
							      winrt: self.options.notification_transport.winRT,
								  balloonFallback: self.options.notification_transport.balloon,
								  customAudio: 0,
								  imageIntegration: self.options.notification_toast.toastSouvenir,
								  group: self.options.notification_toast.groupToast
								},
								prefetch: self.options.notification_advanced.iconPrefetch,
								souvenir: {
									screenshot: false,
									video: 0
								},
								rumble: false
                              });
                        }
              
                }catch(err){
                   if(err === "ACH_NOT_FOUND_IN_SCHEMA") {
                     debug.warn(`${(achievements[i].crc) ? `${achievements[i].crc} (CRC32)` : `${achievements[i].name}`} not found in game schema data ?! ... Achievement was probably deleted or renamed over time > SKIPPING`);
                   }else {
                     debug.error(`Unexpected Error for achievement "${achievements[i].name}": ${err}`);
                   }
                }
            }
            
            await track.save(appID,achievements);
          
          }
        }
        else {
          debug.warn(`binary "${game.binary}" not running`);
        }
          
      }catch(err){
        debug.warn(err);
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
  }
}

instance.lock().then(() => {
  app.start().catch(()=>{});
  
  try {
    websocket();
  }catch(err){
	debug.error(err);
  }

  playtimeMonitor.init()
  .then((monitor)=>{
	
	debug.log("Playtime monitoring activated");
	
	monitor.on("notify",([game, time]) => {
	  if(app.options.notification.playtime){

		    notify({
                appid: game.appid,
                gameDisplayName: game.name,
                achievementDisplayName: game.name,
                achievementDescription: (time) ? time : "Now playing", 
                icon: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.icon}.jpg`,
                image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
            },{
				notify: app.options.notification.notify,
				transport: {
					toast: app.options.notification_transport.toast,
					gntp: app.options.notification_transport.gntp,
					websocket: false
				},
				toast: {
					appid: app.toastID,
					winrt: app.options.notification_transport.winRT,
					balloonFallback: app.options.notification_transport.balloon,
					customAudio: 0,
					imageIntegration: 1,
					group: app.options.notification_toast.groupToast,
					cropIcon: true,
					attribution: "Achievement Watcher"
				},
				gntpLabel: "Playtime",
				prefetch: app.options.notification_advanced.iconPrefetch,
				souvenir: {
					screenshot: false,
					video: 0
				},
				rumble: false
            });
  
	  } 
	}); 
  
  })
  .catch((err)=>{debug.error(err)});
})
.catch((err) => {
  debug.error(err);
  process.exit();
});