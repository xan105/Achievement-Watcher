"use strict";

const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const instance = new(require('single-instance'))('Achievement Updater');
const tasklist = require('win-tasklist');
const { semver } = require("./util/versionCompare.js");
const ffs = require("./util/feverFS.js");
const request = require("./util/request.js");
const download = require("./util/download.js");
const debug = new (require("./util/log.js"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/updater.log")
});

const asar = require('asar-node');

const tempDir = os.tmpdir() || process.env['TEMP'];

var updater = {
  upgrade: function(file){
      debug.log("Starting Upgrade Package...");

      const args = ["/VERYSILENT","/SP-","/NOCANCEL","/NORESTART","/CLOSEAPPLICATIONS"];
      const options = {stdio:[ 'ignore', 'ignore', 'ignore' ], shell: true, windowsHide: true, detached: true, windowsVerbatimArguments: true};
      
      spawn(`"${file}"`, args, options).unref();
      
      debug.log("...Started"); 
  },
  check: async function(){
    try{  
        
      const manifest = require(path.join(path.dirname(process.execPath),'resources/app.asar/package.json'));
      if (!manifest.config.update || !manifest.version) throw "Missing properties in package.json";
      if (!manifest.config.update.github || !manifest.config.update.name) throw "Unvalid Updater Parameters";
      if (!manifest.config.update.github.includes("/")) throw "Unvalid Updater repo";
      
      if (await tasklist.hasProcess("AchievementWatcher.exe")) throw "AchievementWatcher.exe is running > SKIPPING";
      
      debug.log(`Checking update for ${manifest.config.update.github}...`);

      const url = `https://api.github.com/repos/${manifest.config.update.github}/releases/latest`;

      let github = await request.getJson(url,{headers: {"Accept" : "application/vnd.github.v3+json"}});
        
      let version = {
          local: manifest.version,
          remote: github.tag_name
      };

      if (semver(version.local,version.remote)){
      
          debug.log(`Update found: ${version.remote}`);
      
          let asset = github.assets.find( asset => asset.name === manifest.config.update.name);
          
          if (asset) {
            
              debug.log(`Update Package '${asset.name}' found > Dowloading...`);
              
              let file = await download(asset.browser_download_url,path.join(tempDir,github.name,github.tag_name));
            
              debug.log(`Update Package downloaded : "${file}"`);
            
              let size = {
                    remote: asset.size,
                    local: (await ffs.promises.stats(file)).size
              };
                
              if (size.remote === size.local) {
                debug.log("Expected file size");
                this.upgrade(file);
              } else {
                debug.log("Unexpected file size ! > Aborting");
              }

          } else {
            debug.log("No update package found");
          }
          
      } else {
        debug.log("No update found");
      }      
    
    }catch(err){
      debug.log(err);
    }
    
    instance.unlock();

  }
};

instance.lock().then(() => {
  updater.check().catch((err) => { 
    debug.log(err); 
  });
})
.catch((err) => {
  debug.log(err);
  process.exit();
});