"use strict";

(function($, window, document) {
  $(function() {
      
      $("#search-bar input[type=search]").keyup(function(){
      
        let self = $(this);
        let gamelist = $("#game-list ul");
        let li = gamelist.children("li");
        let filter = self.val().replace(/<\/?[^>]+>/gi, '').toUpperCase();
      
        li.each( (index,elem) => {
        
          let _this = $(elem);
          let gameName = _this.find(".game-box .info .title").text().toUpperCase();
          let gameID = _this.find(".game-box").data("appid");
          
          if (/^\d+$/.test(filter)) { //If has only digits check steam appid instead of name
             (gameID == filter) ? _this.show() : _this.hide();
          } else {
             (gameName.includes(filter)) ? _this.show() : _this.hide();
          }
        
        });
      
      });
    
  });
}(window.jQuery, window, document)); 