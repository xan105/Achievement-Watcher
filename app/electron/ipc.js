'use strict';

const { ipcMain } = require('electron');

module.exports.window = (win) => {

  ipcMain.handle('win-close', async (event) => {
      win.close();
  });
      
  ipcMain.handle('win-minimize', async (event) => {
      win.minimize();
  });
      
  ipcMain.handle('win-maximize', async (event) => {
      win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  
  ipcMain.handle('win-isMinimizable', async (event) => {
      return win.minimizable;
  });
  
  ipcMain.handle('win-isMaximizable', async (event) => {
      return win.maximizable;
  });
  
  ipcMain.handle('win-isFrameless', async (event) => {
      return win.isFrameless;
  });
  
  //Sync
  
  ipcMain.on('win-isDev', (event) => {
    event.returnValue = win.isDev;
  });
  
}