'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util'); 
const { exec } = require('child_process');
const lock = new (require("rwlock"))();

const temp = os.tmpdir() || process.env.TEMP;
const bom = "\ufeff";

module.exports = (option = {}) => {
      return new Promise((resolve,reject) => {
        lock.writeLock((release) => { //Prevent Powershell script generation failure when multiple invoke at the same time
            toast(option).then(()=>{
              release();
              return resolve();
            }).catch((err)=>{
              release();
              return reject(err);
            });
        });
      });
}

async function toast(option = {}){
  
  if (os.platform() !== 'win32') return;
  
  let script = path.join(temp,`${Date.now()}.ps1`);
  
  try {

    let isWin8 = false;
    
    let version = os.release().split("."); 
    version = { 
              major: parseInt(version[0]), 
              minor: parseInt(version[1]), 
              build: parseInt(version[2]) 
    }; 

    if (version.major == 6 && ( version.minor == 3 || version.minor == 2) ) { 
      isWin8 = true; 
    }
    else if (version.major <= 6) {
      throw "Unsupported Windows version";
    }

    const default_appID = (isWin8) ? "winstore_cw5n1h2txyewy!Windows.Store" : "Microsoft.WindowsStore_8wekyb3d8bbwe!App";
    
    let options = {
      appID: option.appID || default_appID, 
      title: option.title || "",
      message: option.message || "",
      attribution: option.attribution || "",
      icon: option.icon || "",
      headerImg: option.headerImg || "",
      footerImg: option.footerImg || "",
      silent: option.silent || false,
      longTime: option.longTime || false,
      onClick: option.onClick || "",
      button: option.button || []
    }
    
    let template = `
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    
      $APP_ID = '${options.appID}'
    `;

    if (isWin8) { //old template fallback for Windows 8
      template += `
        [xml]$template = @"
        <toast>
            <visual>
                <binding template="ToastImageAndText02">
                    <image id="1" src="${options.icon}" alt="image1"/>
                    <text id="1">${options.title}</text>
                    <text id="2">${options.message}</text>
                </binding>  
            </visual>
            <audio silent="${options.silent}"/>
        </toast>        
"@
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template.OuterXml)
        
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($xml)
      `;
      
    } else {

      template += `
        $template = @"
        <toast activationType="protocol" launch="${options.onClick}" duration="${options.longTime ? "Long" : "Short"}">
            <visual>
                <binding template="ToastGeneric">
                    <image placement="appLogoOverride" src="${options.icon}" />
                    <image placement="hero" src="${options.headerImg}"/>
                    <text><![CDATA[${options.title}]]></text>
                    <text><![CDATA[${options.message}]]></text>
                    <text placement="attribution"><![CDATA[${options.attribution}]]></text>
                    <image src="${options.footerImg}" />
                </binding>
            </visual>
            <actions>      
      `;
      
      try {    
        options.button.forEach( button => {
          if (button.text && button.onClick) template += `<action content="${button.text}" arguments="${button.onClick}" activationType="protocol"/>`;
        }); 
      }catch(err){/*do nothing*/}  
    
      template += `
        </actions>
            <audio silent="${options.silent}" />
        </toast>
"@
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        
        $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast)
      `;
    
    }
    
    await write(script,template);
    await util.promisify(exec)(`powershell -ExecutionPolicy Bypass -File "${script}"`,{windowsHide: true});
    
    fs.unlink(script, ()=>{});

  } catch (err) {
    fs.unlink(script, ()=>{});
    throw err;
  }
}

function write(file, data){
  return new Promise((resolve,reject) => {
     fs.writeFile(file, bom+data, "utf8", function (err) {
           if (err) {
               return reject(err);
           } else {
               return resolve(file);
           }
     });    
  });      
}