'use strict';

const { 
  app, 
  BrowserWindow, 
  dialog, 
  session, 
  shell
} = require('electron');

const path = require("path");
const fs = require("fs");
const ipc = require(path.join(__dirname,"ipc.js"));

try {

  if (app.requestSingleInstanceLock() !== true) app.quit();

  const manifest = require("../package.json");

  if (manifest.config["disable-gpu"]) app.disableHardwareAcceleration();
  if (manifest.config.appid) app.setAppUserModelId(manifest.config.appid);
  
  let MainWin = null;
  
  app.on('ready', function(){

    let options = manifest.config.window;
    options.show = false;
    options.webPreferences = {
        devTools: manifest.config.debug || false,
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: false,
        enableRemoteModule: true //Remove me when RemoteModule to IPC makeover is done
    };
    
    //electron 9 crash if no icon exists to specified path
    try{
      fs.accessSync(options.icon, fs.constants.F_OK);
    }catch{
      delete options.icon;
    }

    MainWin = new BrowserWindow(options);

    //Frameless
    if (options.frame === false) MainWin.isFrameless = true;
    
    //Debug tool
    if (manifest.config.debug) {
      MainWin.webContents.openDevTools({mode: "undocked"});
      MainWin.isDev = true;
      console.info((({node,electron,chrome })=>({node,electron,chrome}))(process.versions));
      try {
        const contextMenu = require('electron-context-menu')({
			append: (defaultActions, params, browserWindow) => [
				{
					label: 'Reload',
					visible: params,
					click: () => { MainWin.reload() }
				}
			]
        });
      }catch(err){
        dialog.showMessageBoxSync({type: "warning",title: "Context Menu", message: "Failed to initialize context menu.", detail: `${err}`});
      }
    }

    //User agent
    MainWin.webContents.userAgent = manifest.config["user-agent"];
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = manifest.config["user-agent"];
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    //External open links
    const openExternal = function(event, url) {
      if (!url.startsWith("file:///")) {
        event.preventDefault();
        shell.openExternal(url).catch(()=>{});
      }
    };
    MainWin.webContents.on('will-navigate', openExternal); //a href
    MainWin.webContents.on('new-window', openExternal); //a href target="_blank"
    
    //enable ipc
    ipc.window(MainWin);
    
    MainWin.loadFile(manifest.config.window.view);

    MainWin.once('ready-to-show', () => {
      MainWin.show();
      MainWin.focus();
    });

    MainWin.on('closed', () => {
      MainWin = null
    });

  })
  .on('window-all-closed', function() {
      app.quit();
  })
  .on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, url) => {
        event.preventDefault();
      });
   })
   .on('second-instance', (event, argv, cwd) => {
    if (MainWin) {
      if (MainWin.isMinimized()) MainWin.restore();
      MainWin.focus();
    }
  });

}catch(err) {
  dialog.showErrorBox("Critical Error", `Failed to initialize:\n${err}`);
  app.quit();
}