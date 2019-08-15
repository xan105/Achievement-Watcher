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
  
  let script = path.join(temp,`${Date.now()}.ps1`);
  
  try {

    let options = {
      appID: option.appID || "Microsoft.WindowsStore_8wekyb3d8bbwe!App",
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
          <actions>`;

      try {    
        options.button.forEach( button => {
          if (button.text && button.onClick) {
            template = template + `<action content="${button.text}" arguments="${button.onClick}" activationType="protocol"/>`;
          }
        }); 
      }catch(err){}   
          
      template = template + `</actions>
          <audio silent="${options.silent}" />
      </toast>
"@
      
      $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
      $xml.LoadXml($template)
      $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($APP_ID).Show($toast)
    `;
    
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