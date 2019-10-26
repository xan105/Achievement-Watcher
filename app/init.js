'use strict';

const { 
  app, 
  BrowserWindow, 
  dialog, 
  session, 
  shell 
} = require('electron');

try {

  if (app.requestSingleInstanceLock() !== true) app.quit()

  const manifest = require("./package.json");

  if (manifest.config["disable-gpu"]) app.disableHardwareAcceleration()
  if (manifest.config.appid) app.setAppUserModelId(manifest.config.appid);

  app.on('ready', function(){

    let options = manifest.config.window;
    options.show = false;
    options.webPreferences = {
        devTools: manifest.config.debug || false,
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: false
    };

    let win = new BrowserWindow(options);

    win.webContents.userAgent = manifest.config["user-agent"];
    
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = manifest.config["user-agent"];
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    
    if (manifest.config.debug) {
      win.webContents.openDevTools({mode: "undocked"});
      win.isDev = true;
      try {
        const contextMenu = require('electron-context-menu')();
      }catch(err){
        dialog.showMessageBoxSync({type: "warning",title: "Debug Mode Failure", message: "Failed to initialize context menu.", detail: `${err}`});
      }
    }
    
    win.loadFile(manifest.config.window.view);

    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });

    win.on('closed', () => {
      win = null
    });

  })
  .on('window-all-closed', function() {
      app.quit();
  })
  .on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, url) => {
        event.preventDefault();
      });
   });

}catch(err) {
  dialog.showErrorBox("Critical Error", `Failed to initialize:\n${err}`);
  app.quit();
}