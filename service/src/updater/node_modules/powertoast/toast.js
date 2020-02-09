'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util'); 
const { exec } = require('child_process');
const templateXml = require('./template.js');

let winRT;
try {
  winRT = {
    xml : require('@nodert-win10-rs4/windows.data.xml.dom'),
    notifications : require('@nodert-win10-rs4/windows.ui.notifications')
  };
  if (!winRT.xml || !winRT.notifications) winRT = null;
} catch {}

module.exports = async (option = {}) => {

  if (os.platform() !== 'win32') throw "API is only available in Windows.";

  if (!winRT || (winRT && option.disableWinRT === true)) {
    const temp = os.tmpdir() || process.env.TEMP;
    const rng = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) ) + min;
    };
    var script = path.join(temp,`${Date.now()}${rng(0,1000)}.ps1`);
  }

  try {

    let legacyTemplate = false;
    
    const version = windowsGetVersion(); 

    if (version.major == 6 && ( version.minor == 3 || version.minor == 2) ) { //Windows 8 && Windows 8.1
      legacyTemplate = true; 
    }
    else if (version.major <= 6) {
      throw "Unsupported Windows version";
    }

    const defaultAppID = (legacyTemplate) ? "winstore_cw5n1h2txyewy!Windows.Store" : "Microsoft.WindowsStore_8wekyb3d8bbwe!App";
    
    let options = {
      appID: option.appID || defaultAppID,
      title: option.title || "",
      message: option.message || "",
      attribution: option.attribution || "",
      icon: option.icon || "",
      headerImg: option.headerImg || "",
      footerImg: option.footerImg || "",
      silent: option.silent || false,
      audio: option.audio || "",
      longTime: option.longTime || false,
      onClick: option.onClick || "",
      button: option.button || [],
      group: option.group || null
    };
    
    if(option.progress) {
      options.progress = {
         header : option.progress.header || "",
         percent : (option.progress.percent >= 0 && option.progress.percent <= 100) ? (option.progress.percent / 100).toFixed(2) : 0,
         custom : option.progress.custom || "",
         footer : option.progress.footer || "",
         tag: option.progress.tag || null
      }
    }
    
    try{
      if (option.timeStamp) {
        options.timeStamp = new Date(+option.timeStamp *1000).toISOString();
      } else {
        options.timeStamp = "";
      }
    }catch(err){
      options.timeStamp = "";
    }

    let template;
    
    if (!winRT || (winRT && option.disableWinRT === true)) {
      template = `(Get-Process -Id $pid).PriorityClass = 'High'`+ os.EOL +
                 `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null` + os.EOL +
                 `[Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null` + os.EOL +
                 `[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null` + os.EOL +
                 `$APP_ID = '${options.appID}'`+ os.EOL;
    }

    if (legacyTemplate) 
    {
      if (!winRT || (winRT && option.disableWinRT === true)) {
        template += `[xml]$template = @"`+ os.EOL + templateXml.legacy(options) + os.EOL + `"@` + os.EOL +
                    `$xml = New-Object Windows.Data.Xml.Dom.XmlDocument` + os.EOL +
                    `$xml.LoadXml($template.OuterXml)` + os.EOL +
                    `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($xml)`;
      } else {
        template = templateXml.legacy(options);
      }
    } 
    else 
    {
      if (!winRT || (winRT && option.disableWinRT === true)) {
        template += `$template = @"`+ os.EOL + templateXml(options) + os.EOL + `"@` + os.EOL +
                    `$xml = New-Object Windows.Data.Xml.Dom.XmlDocument`+ os.EOL +
                    `$xml.LoadXml($template)` + os.EOL +
                    `$toast = New-Object Windows.UI.Notifications.ToastNotification $xml` + os.EOL;
            
        if(options.progress && options.progress.tag) template += `$toast.tag = "${options.progress.tag}"` + os.EOL;
            
        template += `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast)`;
      } else {
        template = templateXml(options);
      }
    }
    
    if (!winRT || (winRT && option.disableWinRT === true))
    {
    
      const bom = "\ufeff";
      await fs.promises.writeFile(script, bom+template, "utf8");

      const output = await util.promisify(exec)(`powershell -ExecutionPolicy Bypass -File "${script}"`,{windowsHide: true});
      if (output.stderr) throw output.stderr;
      
      await fs.promises.unlink(script).catch(()=>{});
    
    } 
    else 
    {
    
      const xml = new winRT.xml.XmlDocument();
      xml.loadXml(template);

      let toast = new winRT.notifications.ToastNotification(xml);
      
      if (!toast) throw "Failed to create a new 'ToastNotification'";
      
      if(options.progress && options.progress.tag) toast.tag = options.progress.tag; 
      
      const toaster = winRT.notifications.ToastNotificationManager.createToastNotifier(options.appID);
      
      if (!toaster) throw "Failed to create a new 'ToastNotifier'";

      if (toaster.setting === 1) {
        throw "Notifications are disabled by app manifest";
      } else if (toaster.setting === 2) {
        throw "Notifications are disabled by Windows group policy"
      } else if (toaster.setting === 3) {
        throw "Notifications are disabled for this user (system-wide)"
      } else if (toaster.setting === 4) {
        throw "Notifications are disabled for this app only (Windows settings)"
      }

      return toaster.show(toast);
      
    }

  }catch(err) {
  
    if (!winRT || (winRT && option.disableWinRT === true)) {
      fs.unlink(script, function(){
        throw err;
      });
    } else {
      throw err;
    }
    
  }
}

function windowsGetVersion(){
  const version = os.release().split("."); 
  return { major: +version[0], 
            minor: +version[1], 
            build: +version[2]
          };
}