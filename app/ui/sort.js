"use strict";

function sortOptions() {

  let options = {alpha: false, percent: false, time: false};
      
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
  
  if(localStorage.sortByTime === "true") {
        $("#sort-box .sort.time").addClass("active");
        options.time = true;
  } else {
        $("#sort-box .sort.time").removeClass("active");
  }
  
  return options;
  
}

function sort(elem, option = {}) {

   let options = {
     alpha: option.alpha,
     percent: option.percent || false,
     time: option.time || false
   };

   let li = elem.children("li");
   
   li.detach().sort(function(a, b) {
   
      if (options.time){
        let result = $(b).find(".game-box").data("time") - $(a).find(".game-box").data("time");
        if (result != 0) return result;
      }
      
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
        let time = $("#sort-box .sort.time").hasClass("active") ? true : false;
        
        gamelist.fadeOut(()=>{
        
          if (self.hasClass("active")) {
            sort(gamelist,{alpha: false, percent: percent, time: time});
            self.removeClass("active");
            localStorage.sortByAlpha = "false";
          } else {
            sort(gamelist,{alpha: true, percent: percent, time: time});
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
        let time = $("#sort-box .sort.time").hasClass("active") ? true : false;
        
        gamelist.fadeOut(()=>{

          if (self.hasClass("active")) {
            sort(gamelist,{alpha: alpha, percent: false, time: time});
            self.removeClass("active");
            localStorage.sortByPercent = "false";
          } else {
            sort(gamelist,{alpha: alpha, percent: true, time: time});
            self.addClass("active");
            localStorage.sortByPercent = "true";
          }
          gamelist.fadeIn(()=>{ $("#sort-box .sort").css("pointer-events","initial") });
          
        });
    });
    
    $("#sort-box .sort.time").click(function(){
        let self = $(this);
        $("#sort-box .sort").css("pointer-events","none");
        
        let gamelist = $("#game-list ul");
        let alpha = $("#sort-box .sort.alpha").hasClass("active") ? true : false;
        let percent = $("#sort-box .sort.percentage").hasClass("active") ? true : false;
        
        gamelist.fadeOut(()=>{

          if (self.hasClass("active")) {
            sort(gamelist,{alpha: alpha, percent: percent, time: false});
            self.removeClass("active");
            localStorage.sortByTime = "false";
          } else {
            sort(gamelist,{alpha: alpha, percent: percent, time: true});
            self.addClass("active");
            localStorage.sortByTime = "true";
          }
          gamelist.fadeIn(()=>{ $("#sort-box .sort").css("pointer-events","initial") });
          
        });
    });

  });
}(window.jQuery, window, document)); 