"use strict";

function getSteamGlobalStat(appid) {

   $.ajax({ 
      url: `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appid}&format=json`,
      dataType: 'json',
      ContentType: 'json',
      type: 'GET',
      cache: true,
      timeout: 5000,
      beforeSend: ()=>{},
      success: (data) => { 
        for (let globalStat of data.achievementpercentages.achievements) {      
        
           let percent = Math.round(globalStat.percent);
           if(percent > 100) percent = 100;
        
           let elem = $(`#achievement li .achievement[data-name="${globalStat.name}"]`);
           
           elem.find(".stats .community span.data").text(percent);
           
           if(percent >= 0 && percent <= 10) { elem.addClass("rare") }
 
        }
        $(".achievement-list > .header .sort-ach .sort.percentage").addClass("show");
      },
      error: ()=>{},
      complete: ()=>{}
   });
   
}

(function($, window, document) {
  $(function() {
  
     $(document).mouseup(function(e){
          if(e.which === 4) {
            if( $("#achievement").is(":visible")) {
              $("#btn-previous").trigger( "click" );
            } 
          } 
      });
      
      $("#btn-previous").click(function(){
        let self = $(this);
        self.css("pointer-events","none");
        
        if(app.args.name) app.args.name = null;
        
        $("#achievement").fadeOut(500,function() {
            setTimeout(()=>{  
              $("body").removeAttr("style");
              $(".achievement-list > .header .sort-ach .sort").removeClass("show active");
              $("#home").fadeIn(500,function() {
                  self.css("pointer-events","initial");
              });
            }, 300);
        }).scrollTop(0);
    });
    
    $("#btn-scrollup").click(function(){
        let self = $(this);
        self.css("pointer-events","none");
        
        $("#achievement").animate({scrollTop:0}, 500, 'swing', function() { 
           self.css("pointer-events","initial");
        }); 
    });
    
    $("#achievement .achievement-list .header .toggle").click(function(){

        let self = $(this);
        self.css("pointer-events", "none");
        
        let list = self.parent().next("ul");
        let elem = self.closest(".achievement-list");
        let speed = 400;
        
        if (elem.hasClass("active")) {
          list.slideUp(speed);
          elem.removeClass("active");
        } else {
          list.slideDown(speed);
          elem.addClass("active");
        }
        setTimeout(()=>{ self.css("pointer-events", "initial") }, speed);
    });
    
  });
}(window.jQuery, window, document)); 