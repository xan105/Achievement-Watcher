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
        
        $("#dirlist").empty();
        userDir.get()
        .then( (userDirList) => {
          
          for (let dir of userDirList) {
            populateUserDirList(dir.path,dir.notify);
          }
        })
        .catch( (err) => {
          //Do nothing
          console.error(err)
        });
        
        
     });
     
     $("#btn-settings-cancel, #settings .overlay").click(function(){
          let self = $(this);
          self.css("pointer-events","none");
          $("#settings .box").fadeOut(()=>{
            $("#settings").hide();
            let elem = $("#settingNav li").first();
            $("#settingNav li").removeClass("active");
            elem.addClass("active");
            $("#settings .box section.content").removeClass("active");
            $("#settings .box section.content[data-view='"+elem.data("view")+"']").addClass("active");
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
        
        let userDirList = [];
        $("#dirlist > li").each(function(){

          let dir = $(this).find(".path span").text();
          let notify = ($(this).find(".controls .notify").attr("data-notify") === "true") ? true : false;
        
          userDirList.push({"path":dir,"notify":notify});
        });

        userDir.save(userDirList).catch((err)=>{
        
          remote.dialog.showMessageBox({type: "error",title: "Unexpected Error", message: "Error while saving user dir list", detail: `${err}`});
        
        }).finally(()=>{
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
                let elem = $("#settingNav li").first();
                $("#settingNav li").removeClass("active");
                elem.addClass("active");
                $("#settings .box section.content").removeClass("active");
                $("#settings .box section.content[data-view='"+elem.data("view")+"']").addClass("active");
                console.clear();
                if (app.args.appid) app.args.appid = null;
                if (app.args.name) app.args.name = null;
                app.onStart();
            });

          }).catch((err)=>{
              
            $("#settings .box").fadeOut(()=>{
              $("#settings").hide();
              let elem = $("#settingNav li").first();
              $("#settingNav li").removeClass("active");
              elem.addClass("active");
              $("#settings .box section.content").removeClass("active");
              $("#settings .box section.content[data-view='"+elem.data("view")+"']").addClass("active");
              self.css("pointer-events","initial");
              $("#win-settings").css("pointer-events","initial");
              
              remote.dialog.showMessageBox({type: "error",title: "Unexpected Error", message: "Error while writing settings to file.", detail: `${err}`});
              
            });

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
      
      $("#settingNav li").click(function(){
        let self = $(this);
        self.css("pointer-events","none");
        let view = self.data("view");
        
        $("#settingNav li").removeClass("active");
        self.addClass("active");
        
        $("#settings .box section.content").removeClass("active");
        $("#settings .box section.content[data-view='"+view+"']").addClass("active");
        
        self.css("pointer-events","initial");
      });
      
      $("#addCustomDir").click(function(){
        let self = $(this);
        self.css("pointer-events","none");
        
        remote.dialog.showOpenDialog(win,{properties : ['openDirectory','showHiddenFiles']},function(filePaths){
          
          if (filePaths){
            console.log(filePaths);
            
            populateUserDirList(filePaths[0]);

          }else{
            console.log("cancel");
          }
          
          self.css("pointer-events","initial");
        }); 
        
      });
      
      $("#blacklist_reset").click(function(){
         let self = $(this);
         self.css("pointer-events","none");
        
         blacklist.reset()
         .then(()=>{
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
                let elem = $("#settingNav li").first();
                $("#settingNav li").removeClass("active");
                elem.addClass("active");
                $("#settings .box section.content").removeClass("active");
                $("#settings .box section.content[data-view='"+elem.data("view")+"']").addClass("active");
                console.clear();
                if (app.args.appid) app.args.appid = null;
                app.onStart();
         })
         .catch((err)=>{  
            self.css("pointer-events","initial");
            remote.dialog.showMessageBox({type: "error",title: "Unexpected Error", message: "Error while trying to reset user blacklist", detail: `${err}`});     
         });
       }); 

  });
}(window.jQuery, window, document)); 

function populateUserDirList(dirpath,notify = false){

            let template = `<li>
                <div class="path"><span>${dirpath}</span></div>
                <div class="controls">
                  <ul>
                    <li class="edit"><i class="fas fa-pen"></i></li>
                    <li class="trash"><i class="fas fa-trash-alt"></i></li>
                    ${(notify) ? '<li class="notify" data-notify="true"><i class="fas fa-bell"></i></li>' : '<li class="notify" data-notify="false"><i class="fas fa-bell-slash"></i></li>'}
                  </ul>
                </div>
              </li>`;
            
            $("#dirlist").prepend(template);

            let elem = $("#dirlist > li").first();
            if ( elem.find(".path span").width() >= 350) {
              elem.find(".path").addClass("overflow");
            }
            
            elem.find(".controls .trash").click(function(){ elem.remove() });
            elem.find(".controls .notify").click(function(){ 

                if ($(this).attr("data-notify") === "false") {
                  $(this).attr("data-notify","true").html('<i class="fas fa-bell"></i>');
                } else {
                  $(this).attr("data-notify","false").html('<i class="fas fa-bell-slash"></i>');
                }

            });
            elem.find(".controls .edit").click(function(){ 
            
              let path = elem.find(".path span").text();
            
              remote.dialog.showOpenDialog(win,{defaultPath: path,properties : ['openDirectory','showHiddenFiles']},function(filePaths){
              
                  if (filePaths){
                    console.log(filePaths);
                    
                    elem.find(".path span").text(filePaths[0]);
                    elem.find(".path").removeClass("overflow");
                    if ( elem.find(".path span").width() >= 350) {
                      elem.find(".path").addClass("overflow");
                    }

                  }else{
                    console.log("cancel");
                  }
              });
            
            
            });

}