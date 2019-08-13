"use strict";

function sortOptions() {

  let options = {alpha: false, percent: false};
      
  if (localStorage.sortByAlpha === "true" || typeof localStorage.sortByAlpha === 'undefined') {
        $("#sort-box .sort.alpha").addClass("active");
        options.alpha = true;
  } else {
        $("#sort-box .sort.alpha").removeClass("active");
  }
      
  if(localStorage.sortByPercent === "true" || typeof localStorage.sortByPercent === 'undefined') {
        $("#sort-box .sort.percentage").addClass("active");
        options.percent = true;
  } else {
        $("#sort-box .sort.percentage").removeClass("active");
  }
  
  return options;
  
}

function sort(elem, option = {}) {

   let options = {
     alpha: option.alpha,
     percent: option.percent || false
   };

   let li = elem.children("li");
   
   li.detach().sort(function(a, b) {
   
      if (options.percent) {
          let result = $(b).find(".progressBar").data("percent") - $(a).find(".progressBar").data("percent");
          if (result != 0) return result; 
      }

      if (options.alpha) {
          if($(a).find(".info .title").text() < $(b).find(".info .title").text()) return -1; 
          if($(a).find(".info .title").text() > $(b).find(".info .title").text()) return 1;
          return 0;
      }else{
          return $(a).find(".game-box").data("appid") - $(b).find(".game-box").data("appid");
      }

   });

   elem.append(li);
}

(function($, window, document) {
  $(function() {

    $("#sort-box .sort.alpha").click(function(){
        let self = $(this);
        $("#sort-box .sort").css("pointer-events","none");
        
        let gamelist = $("#game-list ul");
        let percent = $("#sort-box .sort.percentage").hasClass("active") ? true : false;
        
        gamelist.fadeOut(()=>{
        
          if (self.hasClass("active")) {
            sort(gamelist,{alpha: false, percent: percent});
            self.removeClass("active");
            localStorage.sortByAlpha = "false";
          } else {
            sort(gamelist,{alpha: true, percent: percent});
            self.addClass("active");
            localStorage.sortByAlpha = "true";
          }
          gamelist.fadeIn(()=>{ $("#sort-box .sort").css("pointer-events","initial") });
          
        });
    });
    
    $("#sort-box .sort.percentage").click(function(){
        let self = $(this);
        $("#sort-box .sort").css("pointer-events","none");
        
        let gamelist = $("#game-list ul");
        let alpha = $("#sort-box .sort.alpha").hasClass("active") ? true : false;
        
        gamelist.fadeOut(()=>{

          if (self.hasClass("active")) {
            sort(gamelist,{alpha: alpha, percent: false});
            self.removeClass("active");
            localStorage.sortByPercent = "false";
          } else {
            sort(gamelist,{alpha: alpha, percent: true});
            self.addClass("active");
            localStorage.sortByPercent = "true";
          }
          gamelist.fadeIn(()=>{ $("#sort-box .sort").css("pointer-events","initial") });
          
        });
    });

  });
}(window.jQuery, window, document)); 