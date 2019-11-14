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
        
        for (let option in app.config.notification) {
               if ( $(`#option_${option} option[value="${app.config.notification[option]}"]`).length > 0 )
               {
                    $(`#option_${option}`).val(app.config.notification[option].toString()).change();
               }
        }
        
        $('#option_customToastAudio').find('option[value="1"]').attr("data-file",toastAudio.getDefault());
        if ( $('#option_customToastAudio option:selected').val() == 2 ) {
          $(`#option_customToastAudio option[data-file="${toastAudio.getCustom()}"]`).prop("selected", true);
        }
        $('#option_customToastAudio').on('change', function() {
          try{
          
              let value = $(this).val();
              if (value >= 1) {

                let filename = $(this).find(':selected').data("file");
                if (!filename || filename == '') return;
                
                let file = path.join(process.env['WINDIR'],"Media",filename);
                $('#customToastAudio_sample').attr("src",file).get(0).play();   
              }
            
          }catch(err){
            debug.log(err);
          }
        });
        
        if (app.config.steam) {
          if (app.config.steam.apiKey) {
            $("#steamwebapikey").val(app.config.steam.apiKey);
          }
        }

        $("#dirlist").empty();
        userDir.get()
        .then( async (userDirList) => {
          
          for (let dir of userDirList) {
            try{
              if (await userDir.check(dir.path)) populateUserDirList({dir: dir.path, notify: dir.notify, reverse: true});
            }catch(err){
              //Do nothing
              debug.log(err);
            }
          }
          
        }).catch( (err) => {
          //Do nothing
          debug.log(err);
        });
        
        try {
          //The API used by windows-focus-assist can change/break at any time in the future.
          //Show focus assist state for information
          const { getFocusAssist } = require('windows-focus-assist');
          const focusAssist = getFocusAssist();
          $("#focus-assist-state span").attr("data-state",focusAssist.value).text(focusAssist.name);
          $("#focus-assist-state").show();
        }catch(err){
          $("#focus-assist-state").hide();
          debug.log(err)
        }
           
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
            $('#option_customToastAudio').off('change');
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
            debug.log("error while reading settings ui");
           }
                        
        });
       
        $("#options-notify .right").children("select").each(function(index) {
                  
           try {
             if ($(this)[0].id !== "" && $(this).val() !== "") {
                 app.config.notification[$(this)[0].id.replace("option_","")] = ($(this).val() === "true") ? true : ($(this).val() === "false") ? false : $(this).val();
             }
           }catch(e){
            debug.log("error while reading settings ui");
           }
                        
        });
        
        let customToastAudio = $('#option_customToastAudio').find(':selected');
        if (customToastAudio.val() == 2) toastAudio.setCustom(customToastAudio.data("file"))
        
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
        
          remote.dialog.showMessageBoxSync({type: "error",title: "Unexpected Error", message: "Error while saving user dir list", detail: `${err}`});
        
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
                $("#sort-box").css("opacity",0).css("pointer-events","none");
                $("#search-bar").css("opacity",0).css("pointer-events","none");
                $("#game-list .isEmpty").hide();
                let elem = $("#settingNav li").first();
                $("#settingNav li").removeClass("active");
                elem.addClass("active");
                $("#settings .box section.content").removeClass("active");
                $("#settings .box section.content[data-view='"+elem.data("view")+"']").addClass("active");
                $('#option_customToastAudio').off('change');
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
              
              remote.dialog.showMessageBoxSync({type: "error",title: "Unexpected Error", message: "Error while writing settings to file.", detail: `${err}`});
              
            });

          });       
        
        });

     });
     
    $("#settings .arrow-list .next").click(function(){
                     let sel = $(this).parent(".right").find("select")[0];
                     let i = sel.selectedIndex;
                     sel.options[++i%sel.options.length].selected = true;
            
                     if ("createEvent" in document) {
                          let evt = document.createEvent("HTMLEvents");
                          evt.initEvent("change", false, true);
                          sel.dispatchEvent(evt);
                     } else { sel.fireEvent("onchange"); }     
     });

     $("#settings .arrow-list .previous").click(function(){
                     let sel = $(this).parent(".right").find("select")[0];
                     let i = sel.selectedIndex;
                     if (i <= 0) { i = sel.options.length }
                     sel.options[--i%sel.options.length].selected = true;
                     
                     if ("createEvent" in document) {
                          let evt = document.createEvent("HTMLEvents");
                          evt.initEvent("change", false, true);
                          sel.dispatchEvent(evt);
                     } else { sel.fireEvent("onchange"); }
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
      
      $("#addCustomDir").click(async function(){
        
        let self = $(this);
        self.css("pointer-events","none");
        
        try {
        
          let dialog = await remote.dialog.showOpenDialog(win,{properties : ['openDirectory','showHiddenFiles']});
  
          if (dialog.filePaths.length > 0){
              debug.log(`Adding folder: ${dialog.filePaths}`);

              if(await userDir.check(dialog.filePaths[0])) {
                  populateUserDirList({dir: dialog.filePaths[0]});
                  debug.log("-> Added");
               } else {
                  debug.log("-> Invalid folder");
                  remote.dialog.showMessageBoxSync({type: "warning",title: "Invalid folder", message: $("#settings .content[data-view='folder'] > .controls .info p").html().replace(/\s{2,}/g,"").replace(/<br>/g,"\n")});
               }
          }else{
              debug.log("Adding folder: User Cancel");
          }

        }catch(err){
          remote.dialog.showMessageBoxSync({type: "error",title: "Unexpected Error", message: "Error adding custom folder", detail: `${err}`});
        };
        
        self.css("pointer-events","initial");

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
            remote.dialog.showMessageBoxSync({type: "error",title: "Unexpected Error", message: "Error while trying to reset user blacklist", detail: `${err}`});     
         });
       }); 
       
      $("#gntp_test").click(async function(){
        let self = $(this);
        self.css("pointer-events","none");
        
        try {
        
          if (await gntp.hasGrowl()) {
            await gntp.send({title: "Achievement Watcher", message:"Hello world", icon: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg'});
          } else {
            throw "Inaccessible endpoint !";
          }
        
        }catch(err){
          remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: "GNTP Failure.", detail: `${err}`});
        }
        
        self.css("pointer-events","initial");
        
      }); 
       
      $("#notify_test").click(function(){ 
         let self = $(this);
         self.css("pointer-events","none");

         let dummy = new remote.BrowserWindow({"frame": false, "backgroundColor": "#000000"});
         dummy.setFullScreen(true);

         setTimeout(()=>{
              
            toast({
             appID: self.next("select").val(),
             title: "Achievement Watcher",
             message: "Hello World",
             icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg",
             attribution: "Achievement",
             silent: (app.config.notification.customToastAudio == 0) ? true : false,
             audio: (app.config.notification.customToastAudio == 2) ? "ms-winsoundevent:Notification.Achievement" : null
            }).then(()=>{

                setTimeout(()=>{
                  self.css("pointer-events","initial");
                  dummy.close();
                },6000);
                       
            }).catch((err)=>{
              self.css("pointer-events","initial");
              dummy.close();
              remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: "Notification Failure.", detail: `${err}`});
            });    
              
         },500);
         
         dummy.on('closed', () => {
            dummy = null
         }); 
      });
      
  });
}(window.jQuery, window, document)); 

function populateUserDirList(option){

            let options = {
              dir: option.dir,
              notify: option.notify || false,
              reverse: option.reverse || false
            }

            let template = `<li>
                <div class="path"><span>${options.dir}</span></div>
                <div class="controls">
                  <ul>
                    <li class="edit"><i class="fas fa-pen"></i></li>
                    <li class="trash"><i class="fas fa-trash-alt"></i></li>
                    ${(options.notify) ? '<li class="notify" data-notify="true"><i class="fas fa-bell"></i></li>' : '<li class="notify" data-notify="false"><i class="fas fa-bell-slash"></i></li>'}
                  </ul>
                </div>
              </li>`;
            
            if (options.reverse) {
              $("#dirlist").append(template);
            } else {
              $("#dirlist").prepend(template);
            }

            let elem = (options.reverse) ? $("#dirlist > li").last() : $("#dirlist > li").first();

            if ( elem.find(".path span").width() >= 350 || options.dir.length > 42) {
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
            
              remote.dialog.showOpenDialogSync(win,{defaultPath: path,properties : ['openDirectory','showHiddenFiles']},async function(filePaths){

               try {
                  if (filePaths){
                    debug.log(`Editing folder to: ${filePaths}`);
 
                    if (await userDir.check(filePaths[0]) ) {
                    
                        elem.find(".path span").text(filePaths[0]);
                        elem.find(".path").removeClass("overflow");
                        if ( elem.find(".path span").width() >= 350) {
                          elem.find(".path").addClass("overflow");
                        }
                        debug.log("-> Edited");
                        
                    } else {
                      debug.log("-> Invalid folder");
                      remote.dialog.showMessageBoxSync({type: "warning",title: "Invalid folder", message: $("#settings .content[data-view='folder'] > .controls .info p").html().replace(/\s{2,}/g,"").replace(/<br>/g,"\n")});
                    }

                  }else{
                    debug.log("Editing folder: User Cancel");
                  }
                  
               }catch(err){
                  remote.dialog.showMessageBoxSync({type: "error",title: "Unexpected Error", message: "Error editing custom folder", detail: `${err}`});
               }   
                  
              });

            });

}