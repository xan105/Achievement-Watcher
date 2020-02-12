"use strict";

const instance = new(require('single-instance'))('Achievement Updater');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const asar = require('asar-node');
const tasklist = require('win-tasklist');
const toast = require('powertoast');
const balloon = require('powerballoon');
const request = require('request-zero');
const semver = require("./util/semver.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/updater.log")
});
const args = require('minimist');

const tempDir = os.tmpdir() || process.env['TEMP'];

var updater = {
  manifest : null,
  init: function(){
    this.manifest = require(path.join(path.dirname(process.execPath),'resources/app.asar/package.json'));
    if (!this.manifest.config.update || !this.manifest.version) throw "Missing properties in package.json";
    if (!this.manifest.config.update.github || !this.manifest.config.update.name) throw "Unvalid Updater Parameters";
    if (!this.manifest.config.update.github.includes("/")) throw "Unvalid Updater repo";
  },
  notify: async function(){
    try{
      await toast({
        appID: this.manifest.config.appid,
        title: "Achievement Watcher",
        message: "Just got updated, check it out.",
        icon: path.join(path.dirname(process.execPath),"icon.png"),
        button: [
          { text: "Changelog", 
            onClick: `https://github.com/${this.manifest.config.update.github}/releases/latest`
          }
        ] 
      });
    }catch{
      await balloon({
        title: "Achievement Watcher",
        message: "Just got updated, check it out.",
        ico: path.join(path.dirname(process.execPath),"icon.ico")
      });
    }
  },
  upgrade: function(file){
      debug.log("Executing upgrade package...");
      const args = ["/VERYSILENT","/SP-","/NOCANCEL","/NORESTART","/CLOSEAPPLICATIONS", "/NOTIFY"];
      const options = {stdio:[ 'ignore', 'ignore', 'ignore' ], shell: true, windowsHide: true, detached: true, windowsVerbatimArguments: true};
      spawn(`"${file}"`, args, options).unref();
  },
  check: async function(){
    try{  
      
      if (await tasklist.hasProcess("AchievementWatcher.exe")) throw "AchievementWatcher.exe is running > SKIPPING";
      
      debug.log(`Checking update for ${this.manifest.config.update.github}...`);

      const url = `https://api.github.com/repos/${this.manifest.config.update.github}/releases/latest`;
      const github = await request.getJson(url,{headers: {"Accept" : "application/vnd.github.v3+json"}});
      const version = {
          local: this.manifest.version,
          remote: github.tag_name
      };

      if (semver(version.local,version.remote)){
      
          debug.log(`Update found: ${version.remote}`);
      
          const asset = github.assets.find( asset => asset.name === this.manifest.config.update.name);
          
          if (asset) {
            debug.log(`Update Package '${asset.name}' found > Dowloading...`);
            const file = await request.download(asset.browser_download_url,path.join(tempDir,github.name,github.tag_name));
            this.upgrade(file.path);
          } else {
            debug.log("No update package found");
          }
          
      } else {
        debug.log("No update found");
      }      
    
    }catch(err){
      debug.log(err);
    }
  }
};

const argv = args(process.argv);
instance.lock().then(() => {
  
  updater.init();

  if (argv.notify === true) {
    updater.notify()
      .catch((err)=>{
        debug.log(err);
      })
      .finally(()=>{
        instance.unlock();
      });
  } else {
    updater.check()
      .catch((err) => { 
        debug.log(err); 
      }).finally(()=>{
        instance.unlock();
      });
  }
}).catch((err) => {
  debug.log(err);
  process.exit();
});