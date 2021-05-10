"use strict";

const os = require("os");
const path = require("path");
const toast = require("powertoast");
const balloon = require("powerballoon");
const getStartApps = require('get-startapps');
const regedit = require('regodit');
const gntp = require("./notification/transport/gntp.js");
const settings = require('./settings.js');
const xinput = require("xinput-ffi");

const cfg_file = path.join(process.env['APPDATA'],"Achievement Watcher/cfg","options.ini");

let winRT;
try {
  winRT = {
    xml : require('@nodert-win10-rs4/windows.data.xml.dom'),
    notifications : require('@nodert-win10-rs4/windows.ui.notifications')
  };
  if (!winRT.xml || !winRT.notifications) winRT = null;
} catch {}


module.exports.toast = async() => {
  try{
  
    const options = await settings.load(cfg_file);
    
    const hasXboxOverlay = await getStartApps.has({id:"GamingOverlay"}); 
    const win_ver = os.release().split(".");
    
    let message;
    if (!winRT || (winRT && options.notification_transport.winRT === false)) {
      message = "PowerShell";
    } else {
      message = "WinRT";
    }

    let payload = {
        appID: "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
        uniqueID: "TOAST_TEST",
        title: "Achievement Watcher",
        message: (options.notification.showDesc) ? `${message}\nHello World` : `${message}`,
        icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg",
        attribution: "Achievement",
        silent: (options.notification_toast.customToastAudio == 0) ? true : false,
        audio: (options.notification_toast.customToastAudio == 2) ? "ms-winsoundevent:Notification.Achievement" : null               
    };

    if(options.notification_toast.groupToast) options.group = {id: "TOAST_TEST_GROUP", title: "Achievement Watcher"};

    if(options.notification_transport.winRT === false) options.disableWinRT = true;

    if (options.notification_advanced.appID && options.notification_advanced.appID !== '') {
        payload.appID = options.notification_advanced.appID;
    } else if (win_ver[0] == '6' && ( win_ver[1] == '3' || win_ver[1] == '2') ) {
        payload.appID = "microsoft.XboxLIVEGames_8wekyb3d8bbwe!Microsoft.XboxLIVEGames";
    } else if (hasXboxOverlay === true){
        payload.appID = "Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App";
    }

    try
    {
      await toast(payload); 
    }
    catch(err){
        if(options.notification_transport.balloon) {
           try{
             await balloon({
                title: payload.title,
                message: (options.notification.showDesc) ? "Balloon Fallback\nHello World" : "Balloon Fallback",
                ico: "./notification/icon/icon.ico"
             });
          }catch(err){
             throw err;
          }
        } else {
          throw err;
        }
    }
    
    if(options.notification.rumble){ xinput.rumble().catch(()=>{}); }
    
  }catch(err){
    throw err;
  }
}

module.exports.gntp = async() => {
  try{

    const options = await settings.load(cfg_file);

    if(await gntp.hasGrowl()) {
        await gntp.send({
                         title: "Achievement Watcher", 
                         message: (options.notification.showDesc) ? "Grrr!\nHello World" : "Grrr!", 
                         icon: "./notification/icon/icon.png"
        });
        
       if(options.notification.rumble){ xinput.rumble().catch(()=>{}); }
        
    } else {
      throw "GNTP endpoint unreachable!"
    }

  }catch(err){
    throw err;
  }
}