"use strict";

const { remote, shell } = require('electron');
const win = remote.getCurrentWindow();

(function($, window, document) {
   $(function() {
   
    $("#win-close").click(function() { 
       $(this).attr("data-closeAllWindow") === "true" ? remote.app.quit() : win.close();   
    });
           
    $("#win-minimize").click(function() { 
        win.minimize(); 
    });
    
    $("#win-maximize").click(function() { 
        win.isMaximized() ? win.unmaximize() : win.maximize();  
    });
    
    $(document).on('click', 'a[href]', function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
    });

    remote.app.on('second-instance', (event, argv, cwd) => {
      if (win) {
        if (win.isMinimized()) { win.restore(); }
        win.focus();
      }
    });
    
   });
}(window.jQuery, window, document));