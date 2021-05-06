"use strict";

const { ipcRenderer } = require("electron");
const os = require('os');
const path = require('path');
const args_split = require('argv-split');
const args = require('minimist');
const moment = require('moment');
const humanizeDuration = require("humanize-duration");
const settings = require(path.join(appPath,"settings.js"));
const achievements = require(path.join(appPath,"parser/achievements.js"));
const blacklist = require(path.join(appPath,"parser/blacklist.js"));
const userDir = require(path.join(appPath,"parser/userDir.js"));
const PlaytimeTracking = require(path.join(appPath,"parser/playtime.js"));
const l10n = require(path.join(appPath,"locale/loader.js"));
const toastAudio = require(path.join(appPath,"util/toastAudio.js"));
const debug = new (require("@xan105/log"))({
  console: ipcRenderer.sendSync("win-isDev") || false,
  file: path.join(remote.app.getPath('userData'),`logs/${remote.app.name}.log`)
});

var app = {
  args: getArgs(remote.process.argv),
  config : settings.load(),
  errorExit: function(err, message = "An unexpected error has occured"){
       remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: `${message}`, detail: `${err}`});
       remote.app.quit();
  },
  onStart : function(){

   let self = this;
   
   debug.log(`${remote.app.name} loading...`);
   
   $("title-bar")[0].inSettings = true;
   
   l10n.load(self.config.achievement.lang).then((locale)=>{
      moment.locale(locale);
   }).catch((err)=>{
      debug.log(err);
      app.errorExit(err,"Error loading lang.");
   });

   $("#user-info .info .name").text(os.userInfo().username || "User");

   let loadingElem = {
      elem: $("#game-list .loading"),
      progress: $("#game-list .loading .progressBar"),
      meter: $("#game-list .loading .progressBar > .meter")
   };
  
   $("#user-info .info .stats li:eq(0) span.data").text("0");
   $("#user-info .info .stats li:eq(1) span.data").text("0");
   $("#user-info .info .stats li:eq(2) span.data").text("0");
   
   $("#search-bar input[type=search]").val("").change().blur();
   
   achievements.makeList(self.config,(percent)=>{
   
      loadingElem.progress.attr("data-percent",percent);
      loadingElem.meter.css("width",percent);

   }).then((list) => {

      loadingElem.elem.hide();

      if (list.length == 0) {
        debug.log("No game found !");
        $("#game-list .isEmpty").show();
        return;
      }
      
      debug.log("Populating game list ...");

      let elem = $("#game-list ul");
      
      elem.empty();
      
      let progress_cache = [];

      for (let game in list) {

        if ( list[game].achievement.unlocked > 0 || self.config.achievement.hideZero == false) {
        
        let progress = Math.round((100 * list[game].achievement.unlocked) / list[game].achievement.total);
        
        progress_cache.push(progress);
       
        let timeMostRecent = Math.max.apply(Math,list[game].achievement.list.filter(ach => ach.Achieved && ach.UnlockTime > 0).map((ach) => { return ach.UnlockTime }));
        
        let portrait = self.config.achievement.thumbnailPortrait;

        (portrait) ? $("#game-list").addClass("view-portrait") : $("#game-list").removeClass("view-portrait");
             
        let template = `
            <li>
                <div class="game-box" data-index="${game}" data-appid="${list[game].appid}" data-time="${(timeMostRecent > 0) ? timeMostRecent : 0}" ${(list[game].system) ? `data-system="${list[game].system}"` : ''}>
                  <div class="loading-overlay"><div class="content"><i class="fas fa-spinner fa-spin"></i></div></div>
                  ${(portrait && list[game].img.portrait) ? `<div class="header glow" style="background: url('${list[game].img.portrait}');">` : `<div class="header" style="background: url('${list[game].img.header}');">`}
                  </div>
                  <div class="info">
                       <div class="title">${list[game].name}</div>
                       <div class="progressBar" data-percent="${progress}"><span class="meter" style="width:${progress}%"></span></div>
                       ${(list[game].source) ? `<div class="source">${list[game].source}</div>`: ''}
                  </div>
                </div>
            </li>
            `;

         elem.append(template); 
         
         }

      }
      
      let average_progress = (progress_cache.length > 0) ? Math.floor(progress_cache.reduce((acc, curr) => ( acc + curr )) / progress_cache.length) : 0;
      
      $("#user-info .info .stats li:eq(2) span.data").text(average_progress);
      
      $("#user-info .info .stats li:eq(1) span.data").text(list.filter( game => game.achievement.unlocked == game.achievement.total ).length);
      
      $("#user-info .info .stats li:eq(0) span.data").text(list.filter( game => game.achievement.unlocked > 0).reduce((acc, curr) => { return acc + parseInt(curr.achievement.unlocked) }, 0));

      if ($('#game-list .game-box[data-system="playstation"]').length > 0) {
      
         $("#user-info .info .trophy li.platinum span").text(list.filter( game => game.system === "playstation").reduce((acc, curr) => { return acc + curr.achievement.list.filter( ach => ach.Achieved && ach.type === "P").length }, 0));
         
         $("#user-info .info .trophy li.gold span").text(list.filter( game => game.system === "playstation").reduce((acc, curr) => { return acc + curr.achievement.list.filter( ach => ach.Achieved && ach.type === "G").length }, 0));
         
         $("#user-info .info .trophy li.silver span").text(list.filter( game => game.system === "playstation").reduce((acc, curr) => { return acc + curr.achievement.list.filter( ach => ach.Achieved && ach.type === "S").length }, 0));
         
         $("#user-info .info .trophy li.bronze span").text(list.filter( game => game.system === "playstation").reduce((acc, curr) => { return acc + curr.achievement.list.filter( ach => ach.Achieved && ach.type === "B").length }, 0));
         
          $("#user-info .info .trophy").show();
      
      } else {
        $("#user-info .info .trophy").hide();
      }

      $("#game-list .game-box").click(function(){ self.onGameBoxClick($(this),list) });
      
      $("#game-list .game-box").contextmenu(function(e) { 
         e.preventDefault();
         let self = $(this);
         let appid = self.data("appid");

         const { Menu, MenuItem, nativeImage } = remote;
         const menu = new Menu();
         menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/cross.png")), label: $("#game-list").attr("data-contextMenu0"), click() { 
         
          try{
            blacklist.add(appid);
            app.onStart();
          }catch(err){
            remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: `Failed to add item to user blacklist`, detail: `${err}`});
          }
         
          } }));
          
         if (!self.data("system")) //Steam only
         {

           menu.append(new MenuItem({label: "Reset playtime and last played", async click() { 
             self.css("pointer-events","none");
             await PlaytimeTracking.reset(appid).catch((err)=>{debug.error(err)});
             self.css("pointer-events","initial");
           } }));
           menu.append(new MenuItem({type: 'separator'}));

           if (app.config.notification_advanced.iconPrefetch){
                menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/image.png")), label: $("#game-list").attr("data-contextMenu1"), async click() { 
                  self.css("pointer-events","none");
                  self.addClass("wait");
                  try{
                  
                    const request = require('request-zero');
                    const cache = path.join(remote.app.getPath('userData'),`steam_cache/icon/${appid}`);
                  
                    for (let achievement of list.find(game => game.appid == appid).achievement.list)
                    {
                      await Promise.all([
                          request.download(achievement.icon,cache),
                          request.download(achievement.icongray,cache)
                      ]).catch(()=>{});
                    }
                   }catch(err){
                    remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: `Failed to build icon cache`, detail: `${err}`});
                   }
                   self.removeClass("wait");
                   self.css("pointer-events","initial");
                } }));
            } 

            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/file-text.png")), label: "Generate achievements.json for Goldberg Emu", async click() { 
                  self.css("pointer-events","none");
                  try{
                    const request = require('request-zero');
                    const ffs = require("@xan105/fs");
                    
                    let dialog = await remote.dialog.showSaveDialog(remote.getCurrentWindow(),{ 
                      title: "Choose where to generate achievements.json",
                      buttonLabel: "Generate",
                      defaultPath: "achievements.json",
                      properties: ['showHiddenFiles', 'dontAddToRecent']
                    });
                    
                    self.addClass("wait");
                    
                    if (dialog.filePath.length > 0){
                      const filePath = dialog.filePath;
                      const dir = path.parse(filePath).dir;
                      const achievements = list.find(game => game.appid == appid).achievement.list;
 
                      let result = [];
                      
                      for (let achievement of achievements)
                      {
                        try{
                          let icons = await Promise.all([
                              request.download(achievement.icon,path.join(dir,"images")),
                              request.download(achievement.icongray,path.join(dir,"images"))
                          ]);
                          result.push({
                            description: achievement.description || "",
                            displayName: achievement.displayName,
                            hidden: achievement.hidden,
                            icon: "images/" + path.parse(icons[0].path).base,
                            icongray: "images/" + path.parse(icons[1].path).base,
                            name: achievement.name
                          });
                        }catch{
                          result.push({
                            description: achievement.description || "",
                            displayName: achievement.displayName,
                            hidden: achievement.hidden,
                            name: achievement.name
                          });
                        }
                      }
                      
                      if (result.length > 0){
                         await ffs.writeFile(filePath,JSON.stringify(result, null, 2));
                      }
                      
                    }

                  }catch(err){
                    remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: `Failed to generate achievements.json`, detail: `${err}`});
                  }
                  self.removeClass("wait");
                  self.css("pointer-events","initial");
            } })); 

            menu.append(new MenuItem({type: 'separator'}));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "Steam", click() {remote.shell.openExternal(`https://store.steampowered.com/app/${appid}/`)} }));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "SteamDB", click() {remote.shell.openExternal(`https://steamdb.info/app/${appid}/`)} }));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "PCGamingWiki", click() {remote.shell.openExternal(`https://pcgamingwiki.com/api/appid.php?appid=${appid}`)} }));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "API (Achievement schema)", click() {remote.shell.openExternal(`https://api.xan105.com/steam/ach/${appid}?lang=${app.config.achievement.lang}`)} }));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "API (App info)", click() {remote.shell.openExternal(`https://api.xan105.com/v2/steam/appinfo/${appid}`)} }));
          }

         menu.popup({ window: remote.getCurrentWindow() });
         
       });
      
      if (self.args.appid) $(`#game-list .game-box[data-appid="${self.args.appid.toString().replace(/[^\d]/g, '')}"]`).first().trigger("click");

      sort(elem,sortOptions());
   
   }).catch((err) => {
      loadingElem.elem.hide();
      $("#game-list .isEmpty").show();
      remote.dialog.showMessageBoxSync({type: "error", title: "Unexpected Error", message: "Game list generation failure", detail: `${err}`});
   }).finally(() => {
      $("#user-info").fadeTo('fast', 1).css("pointer-events","initial");
      $("#sort-box").fadeTo('fast', 1).css("pointer-events","initial");
      $("#search-bar").fadeTo('fast', 1).css("pointer-events","initial");
      $("title-bar")[0].inSettings = false;
   });

  },
  onGameBoxClick: function(self,list){
        self.css("pointer-events","none");

        let game = list.find( elem => elem.appid == self.data("appid") && list.indexOf(elem) == self.data("index"));

        if (self.data('time') > 0) $("#unlock > .header .sort-ach .sort.time").addClass("show");
        
        $("#search-bar-float input[type=search]").val("").blur().removeClass("has"); //reset
        
        $("#home").fadeOut(function() {
            
            if(game.img.background) {

              if (game.system === "uplay") {
                let gradient = `linear-gradient(to bottom right, rgba(0, 47, 75, .8), rgba(35, 54, 78, 0.9))`;
                $("body").fadeIn().attr("style",`background: ${gradient}, url('${game.img.background}')`);
              } else {
                $("body").fadeIn().css("background",`url('${game.img.background}')`);
              }
              
            } else {
              $("body").fadeIn().css("background",`url('../resources/img/ach_background.jpg')`);
            }
            
            if (game.system) {
              $("#achievement .wrapper > .header").attr("data-system",game.system);
            } else {
              $("#achievement .wrapper > .header").removeAttr("data-system");
            }
            
            if(game.img.icon) {
              $("#achievement .wrapper > .header .title .icon").css("background",`url('${game.img.icon}')`);
            }

            $("#achievement .wrapper > .header .title span").text(game.name);
            $("#achievement .wrapper > .header .stats .counter").attr("data-count",game.achievement.unlocked).attr("data-max",game.achievement.total).attr("data-percent",self.find(".progressBar").data("percent"));
            
            if(game.system === "playstation"){
              
              $('#achievement .wrapper > .header[data-system="playstation"] .trophy li.platinum span').text(game.achievement.list.filter( ach => ach.Achieved && ach.type === "P").length);
              $('#achievement .wrapper > .header[data-system="playstation"] .trophy li.gold span').text(game.achievement.list.filter( ach => ach.Achieved && ach.type === "G").length);
              $('#achievement .wrapper > .header[data-system="playstation"] .trophy li.silver span').text(game.achievement.list.filter( ach => ach.Achieved && ach.type === "S").length);
              $('#achievement .wrapper > .header[data-system="playstation"] .trophy li.bronze span').text(game.achievement.list.filter( ach => ach.Achieved && ach.type === "B").length);
              
            }
            
            $('#achievement .wrapper > .header .playtime').hide();
            $('#achievement .wrapper > .header .lastplayed').hide();
            if (game.system !== "playstation" && game.system !== "uplay"){
              PlaytimeTracking(game.appid).then(({playtime, lastplayed})=>{
                if(playtime > 0) {
                  let humanized;
                  if ( playtime < 60 ) {
                    humanized = moment.duration(playtime,'seconds').humanize();
                  } else if (playtime >= 86400){
                    humanized = humanizeDuration(playtime * 1000, { language: moment.locale(), fallbacks: ["en"], units: ["h", "m"], round: true }) + " (~ " + moment.duration(playtime,'seconds').humanize() + ")";
                  } else {
                    humanized = humanizeDuration(playtime * 1000, { language: moment.locale(), fallbacks: ["en"], units: ["h", "m"], round: true });
                  }
                  $('#achievement .wrapper > .header .playtime span').text(`${humanized}`);
                  $('#achievement .wrapper > .header .playtime').css("display","inline-block");
                }
                
                if(lastplayed > 0){
                  $('#achievement .wrapper > .header .lastplayed span').text(`${moment.unix(lastplayed).format('ll')}`);
                  $('#achievement .wrapper > .header .lastplayed').css("display","inline-block");
                }
              }).catch((err)=>{debug.error(err)});
            }
            
            $("#unlock > .header .sort-ach .sort.time").removeClass("active");
            let unlock = $("#unlock ul");
            let lock = $("#lock ul");
            unlock.empty();
            lock.empty();
            
            let hidden_counter = 0;

            let i = 0;
            for (let achievement of game.achievement.list) {

                const percent = (achievement.MaxProgress > 0) ? Math.floor((achievement.CurProgress / achievement.MaxProgress ) * 100) : '0';
                
                let template = `
                <li>
                      
                         <div class="achievement" data-name="${achievement.name}" data-index="${i}">
                            <div class="box">
                              <div class="glow mask contain">
                                  <div class="glow mask ray ">
                                    <div class="glow fx"></div>
                                  </div>
                              </div>
                              <div class="icon" style="background: url('${achievement.Achieved ? achievement.icon : achievement.icongray}');"></div>
                            </div>
                            <div class="content">
                                <div class="title">${game.system === "playstation" ? `<i class="fas fa-trophy" data-type="${achievement.type}"></i> ${achievement.displayName}` : `${achievement.displayName}`}</div>
                                <div class="description">${achievement.description || ''}</div>
                                <div class="progressBar" data-current="${achievement.CurProgress || '0'}" data-max="${achievement.MaxProgress || '0'}" data-percent="${percent}">
                                <span class="meter" style="width:${percent}%"></span></div>
                            </div>
                            <div class="stats">
                              <div class="time" data-time="${achievement.UnlockTime}"><i class="fas fa-clock"></i> 
                                <span>${moment.unix(achievement.UnlockTime).format('L LT')}</span>
                                <span>${moment.unix(achievement.UnlockTime).fromNow()}</span>
                              </div>
                              <div class="community"><i class="fab fa-steam"></i> <span class="data">--</span>% ${$("#achievement .achievements").data("lang-globalStat")}</div>
                            </div>
                        </div> 
                      
                </li>
                `;

                if (achievement.Achieved) {
                  unlock.append(template);
                  i+=1;
                } else {
                  
                  if(achievement.hidden == 1 && !app.config.achievement.showHidden) {
                    hidden_counter = hidden_counter +1;
                    $(`${template}`).appendTo(lock).addClass("hidden");
                  } else {
                    lock.append(template);
                    i+=1;
                  }

                }
            
            }
            
            if($("#unlock > .header .sort-ach .sort.time").hasClass("show") && localStorage.sortAchByTime === "true") {
				$("#unlock > .header .sort-ach .sort.time").trigger("click");
			}
            
            let count_unlocked = game.achievement.list.filter( elem => elem.Achieved).length; /*can replace by value on header which were calculated parse etc already*/
            let count_locked = game.achievement.list.length - count_unlocked;
            
            $("#unlock .header .title").attr("data-count",count_unlocked);
            $("#lock .header .title").attr("data-count",count_locked);
            
            if ( count_unlocked == 0) {
              
              let template = `
              <li>
                <div class="notice">
                  <p>${$("#unlock").data("lang-noneUnlocked")} <i class="fas fa-frown-open"></i> ${$("#unlock").data("lang-play")}</p>
                  <p>⚠️ Why is nothing unlocking ? please kindly read the "FAQ / Troubleshoot" section of the <a href="https://github.com/xan105/Achievement-Watcher/wiki" target="_blank">Wiki</a>.</p>
                  </div>
              </li>`;
              unlock.append(template);
            } 
            
            if ( count_locked == 0 ) {
              $("#lock").hide();
            } else {
              $("#lock").show();
            }
            
            let hidden_template = `
                <li id="hidden-disclaimer">
                    
                      <div class="achievement">
                          <div class="icon" >
                            <i class="fas fa-plus" data-remaining="${hidden_counter}"></i>
                          </div>
                          <div class="content">
                              <div class="title">${hidden_counter} ${$("#lock").data("lang-title")}</div>
                              <div class="description">${$("#lock").data("lang-message")}</div>
                          </div>
                          <div class="show-hidden"><div id="btn-show-hidden">${$("#lock").data("lang-hidden")}</div></div>
                      </div> 
                 </li>
            `;
            
            if (hidden_counter > 0) {
              lock.append(hidden_template);
              $("#btn-show-hidden").click(function(){
                $(this).css("pointer-events", "none");
                 $("#lock ul li.hidden").insertAfter("#hidden-disclaimer");
                 $("#hidden-disclaimer").fadeOut(400,function(){
                  $("#lock ul li:not(#hidden-disclaimer)").fadeIn(800);
                 });
              });
            }

            let elem = $("#achievement .achievement-list ul > li");
            elem.removeClass("highlight");

            if (game.system){
              $(".achievement .stats .community").hide();
            }
            else {
              $(".achievement .stats .community").show();
              getSteamGlobalStat(self.data("appid"));
            }

            $("#achievement").fadeIn(600,function() {
              if(app.args.appid && app.args.name) {
                  let target = elem.find(`.achievement[data-name="${app.args.name.toString().replace(/<\/?[^>]+>/gi, '')}"]`).parent("li");
                  target.addClass("highlight");
                  
                  let pos = (target.offset().top + $(this).scrollTop()) - target.outerHeight(true);

                  $(this).animate({
                    scrollTop:(pos)
                  }, 250, 'swing');
              }
            
                self.css("pointer-events","initial");
            });
        });
      }
};

(function($, window, document) {
  $(function() {
  
      try {
        
        app.onStart();

        remote.app.on('second-instance', (event, argv, cwd) => {
          app.args = getArgs(argv);
          if (app.args.appid) {
            app.onStart();  
          }    
        });
      
      }catch(err) {
        debug.log(err);
        app.errorExit(err);
      }

  });
}(window.jQuery, window, document)); 

function getArgs(argv){

  if(argv[1]){
    if (argv[1].includes("ach:")) {
     argv[1] = argv[1].replace("ach:","");
     argv = args_split(argv[1]);
    }
  }

  return args(argv);
}