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
      
      $("#search-bar input[type=search]").change(function(){
		let self = $(this);
		
		if (self.val().length > 0) self.addClass("has");
		else self.removeClass("has");
      
      });

      $(document).keydown(function(e) {
		if(e.ctrlKey && e.which === 70) { //CTRL+F
			if( !$("#achievement").is(":visible")) {
				if ($("#search-bar input[type=search]").is(":focus"))
					$("#search-bar input[type=search]").blur();
				else {
					$("#search-bar input[type=search]").focus();
				}
			}
		}
      });
      
      $("#search-bar input[type=search]").keyup(function(e) {
		if (e.which === 27){ //ESC
			this.val("").change();
		}
      });

  });
}(window.jQuery, window, document)); 