"use strict";

(function($, window, document) {
  $(function() {

     $("#win-settings").click(function(){
        $(this).css("pointer-events","none");
        $("#settings").show();
        $("#settings .box").fadeIn();
        
        for (let option in app.config.achievement) {
               if ( $(`#option_${option} option[value="${app.config.achievement[option]}"]`).length > 0 )
               {
                    $(`#option_${option}`).val(app.config.achievement[option].toString()).change();
               }
        }
        
        if (app.config.steam) {
          if (app.config.steam.apiKey) {
            $("#steamwebapikey").val(app.config.steam.apiKey);
          }
        }
        
     });
     
     $("#btn-settings-cancel, #settings .overlay").click(function(){
          let self = $(this);
          self.css("pointer-events","none");
          $("#settings .box").fadeOut(()=>{
            $("#settings").hide();
            self.css("pointer-events","initial");
            $("#win-settings").css("pointer-events","initial");
          });
       });
       
       $("#btn-settings-save").click(function(){
     
     let self = $(this);
     self.css("pointer-events","none");
     
        $("#options-ui .right").children("select").each(function(index) {
                  
           try {
             if ($(this)[0].id !== "" && $(this).val() !== "") {
                 app.config.achievement[$(this)[0].id.replace("option_","")] = ($(this).val() === "true") ? true : ($(this).val() === "false") ? false : $(this).val();
             }
           }catch(e){
            console.error("error while reading settings ui");
           }
                        
        });
        
        let steamApiKey = $("#steamwebapikey").val().trim();
        if (steamApiKey.length > 0){

          app.config.steam = { apiKey : steamApiKey };
          
        } else {
          if (app.config.steam){
            if (app.config.steam.apiKey) {
              delete app.config.steam.apiKey; 
            }
          }
        }
    
        settings.save(app.config).then(()=>{
        
          $("#settings .box").fadeOut(()=>{
              
              if( $("#achievement").is(":visible")) {
                $("#btn-previous").trigger( "click" );
              }
              $("#settings").hide();
              $("#game-list ul").empty();
              $("#game-list .loading .progressBar").attr("data-percent",0);
              $("#game-list .loading .progressBar > .meter").css("width","0%");
              self.css("pointer-events","initial");
              $("#win-settings").css("pointer-events","initial");
              $("#game-list .loading").show();
              $("#user-info").css("opacity",0).css("pointer-events","none");
              $("#game-list .isEmpty").hide();
              console.clear();
              if (app.args.appid) app.args.appid = null;
              app.onStart();
          });

        }).catch((err)=>{
            
          $("#settings .box").fadeOut(()=>{
            $("#settings").hide();
            self.css("pointer-events","initial");
            $("#win-settings").css("pointer-events","initial");
            
            remote.dialog.showMessageBox({type: "error",title: "Unexpected Error", message: "Error while writing settings to file.", detail: `${err}`});
            
          });
            
           
       });

     });
     
     $("#options-ui .next").click(function(){
                     let sel = $(this).parent(".right").find("select")[0];
                     let i = sel.selectedIndex;
                     sel.options[++i%sel.options.length].selected = true;
     });

     $("#options-ui .previous").click(function(){
                     let sel = $(this).parent(".right").find("select")[0];
                     let i = sel.selectedIndex;
                     if (i <= 0) { i = sel.options.length }
                     sel.options[--i%sel.options.length].selected = true;
     });       
     
     $("#option_lang").mouseover(function() {
        let self = $(this);
        let tooltip = self.find("option:selected").data("tooltip");
        self.attr("title",tooltip);
      });  

  });
}(window.jQuery, window, document)); 