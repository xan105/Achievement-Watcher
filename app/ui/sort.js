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

    $("#sort-box .sort").click(function(){
    
        let self = $(this);
        $("#sort-box .sort").css("pointer-events","none");
        
        let gamelist = $("#game-list ul");
        let sortby = {
          alpha : $("#sort-box .sort.alpha").hasClass("active") ? true : false,
          percent: $("#sort-box .sort.percentage").hasClass("active") ? true : false,
          time: $("#sort-box .sort.time").hasClass("active") ? true : false
        }
        
        gamelist.fadeOut(()=>{

          if (self.hasClass("alpha")) {
            localStorage.sortByAlpha = sortby.alpha = !sortby.alpha;
          }
          else if (self.hasClass("percentage")) {
            localStorage.sortByPercent = sortby.percent = !sortby.percent;
          }
          else if (self.hasClass("time")) {
            localStorage.sortByTime = sortby.time = !sortby.time;
            
          }
          
          sort(gamelist,{alpha: sortby.alpha, percent: sortby.percent, time: sortby.time});
          
          (self.hasClass("active")) ? self.removeClass("active") : self.addClass("active");
          
          gamelist.fadeIn(()=>{ $("#sort-box .sort").css("pointer-events","initial") });
    
        });
        
    });

    $(".achievement-list > .header .sort-ach .sort").click(function(){
    
        let self = $(this);
        self.css("pointer-events","none");
        
        let root = self.closest(".achievement-list");
        let elem = root.children("ul");
        let li = elem.children("li:not('#hidden-disclaimer')");

        let sortby = {
          percent: root.find(".header .sort-ach .sort.percentage").hasClass("active") ? true : false,
          time: root.find(".header .sort-ach .sort.time").hasClass("active") ? true : false
        }
        
        if (self.hasClass("percentage")) {
            sortby.percent = !sortby.percent;
        }
        else if (self.hasClass("time")) {
            sortby.time = !sortby.time; 
        }

        li.detach().sort(function(a, b) {
        
              if (sortby.percent) {
                let result = parseInt($(a).find(".achievement .stats .community .data").text()||0) - parseInt($(b).find(".achievement .stats .community .data").text()||0);
                if (result != 0) return result;
              }  
              if (sortby.time) {
                let result = $(b).find(".achievement .stats .time").data("time") - $(a).find(".achievement .stats .time").data("time");
                if (result != 0) return result;
              } else {
                return $(a).find(".achievement").data("index") - $(b).find(".achievement").data("index");
              }
        });
           
        elem.prepend(li);
        
        (self.hasClass("active")) ? self.removeClass("active") : self.addClass("active");
          
        self.css("pointer-events","initial");

    });

  });
}(window.jQuery, window, document)); 