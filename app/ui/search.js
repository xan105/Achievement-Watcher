"use strict";

(function($, window, document) {
  $(function() {
      
  $("#search-bar input[type=search]").keyup(function(){
      
    const self = $(this);
    const filter = self.val().replace(/<\/?[^>]+>/gi, '').toUpperCase();
    const gamelist = $("#game-list ul");
    const li = gamelist.children("li");
    
    li.each( (index,elem) => {
        
      const _this = $(elem);
      const gameName = _this.find(".game-box .info .title").text().toUpperCase();
      const gameID = _this.find(".game-box").data("appid");
          
      if (/^\d+$/.test(filter)) { //If has only digits check steam appid instead of name
        gameID == filter ? _this.show() : _this.hide();
      } else {
        gameName.includes(filter) ? _this.show() : _this.hide();
      }
        
    });
      
  });
  
  $("#search-bar-float input[type=search]").keyup(function(){

    const self = $(this);
    const searchValue = self.val().toString().toLowerCase();
    const achievementlist = $("#achievement .achievement-list ul");
    const li = achievementlist.children("li:not(#hidden-disclaimer)"); 
    
    const hidden = $("#lock li#hidden-disclaimer").is(":visible");
    if (hidden && searchValue.length > 0) {
      $("#lock ul li.hidden").insertAfter("#hidden-disclaimer");
      $("#hidden-disclaimer").hide();
    }

    li.each( (index,elem) => {  
        const _this = $(elem);
        if ( _this.find('> div.notice').length > 0 ) return; //ignore notice placeholder when no unlocked achievement
        
        const achievementName = _this.find(".achievement .content .title").text().toString().toLowerCase();
        const achievementID = _this.find(".achievement").data("name").toString().toLowerCase();   
        
        if (!(_this.hasClass("hidden") && hidden))
          (achievementName.includes(searchValue) || achievementID === searchValue) ? _this.show() : _this.hide();
        });
  });
  
  $("#search-bar input[type=search], #search-bar-float input[type=search]").change(function(){
		const self = $(this);
		if (self.val().length > 0) self.addClass("has");
		else self.removeClass("has"); 
  });

  $(document).keydown(function(e) {
    if(e.ctrlKey && e.which === 70) { //CTRL+F
      if($("#achievement").is(":visible")) {
        const elem = $("#search-bar-float input[type=search]");
        elem.is(":focus") ? elem.blur() : elem.focus();
      } else {
        const elem = $("#search-bar input[type=search]");
        elem.is(":focus") ? elem.blur() : elem.focus();
      }
    }
  });

  });
}(window.jQuery, window, document)); 