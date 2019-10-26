"use strict";

const path = require('path');
const appPath = remote.app.getAppPath();
const args_split = require('argv-split');
const args = require('minimist');
const moment = require('moment');
const toast = require('powertoast');
const settings = require(path.join(appPath,"settings.js"));
const achievements = require(path.join(appPath,"parser/achievements.js"));
const blacklist = require(path.join(appPath,"parser/blacklist.js"));
const userDir = require(path.join(appPath,"parser/userDir.js"));
const user = require(path.join(appPath,"util/user.js"));
const gntp = require(path.join(appPath,"util/gntp.js"));
const l10n = require(path.join(appPath,"locale/loader.js"));
const toastAudio = require(path.join(appPath,"util/toastAudio.js"));
const debug = new (require(path.join(appPath,"util/log.js")))({
  console: win.isDev || false,
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
   
   $("#win-settings").css("pointer-events","none");
   
   l10n.load(self.config.achievement.lang).then((locale)=>{
      moment.locale(locale);
   }).catch((err)=>{
      debug.log(err);
      app.errorExit(err,"Error loading lang.");
   });

   user.get(true).then((user) => {
      if (user.avatar) $("#user-info .avatar").css("background",`url(${user.avatar})`);
      $("#user-info .info .name").text(user.name);
   }).catch((err)=>{});

   let loadingElem = {
      elem: $("#game-list .loading"),
      progress: $("#game-list .loading .progressBar"),
      meter: $("#game-list .loading .progressBar > .meter")
   };
  
   achievements.makeList({
      lang: self.config.achievement.lang, 
      merge: self.config.achievement.mergeDuplicate,
      steam: self.config.achievement.legitSteam,
      key: self.config.steam.apiKey,
      recent: self.config.achievement.timeMergeRecentFirst,
      importCache: self.config.achievement.importCache
   },(percent)=>{
   
      loadingElem.progress.attr("data-percent",percent);
      loadingElem.meter.css("width",percent);

   }).then((list) => {

      loadingElem.elem.hide();

      if (!list || list.length == 0) {
        $("#game-list .isEmpty").show();
        return;
      }

      let elem = $("#game-list ul");
      
      elem.empty();
      
      let progress_cache = [];

      for (let game in list) {

        if ( list[game].achievement.unlocked > 0 || self.config.achievement.hideZero == false) {
        
        let progress = Math.round((100 * list[game].achievement.unlocked) / list[game].achievement.total);
        
        progress_cache.push(progress);
       
        let timeMostRecent = Math.max.apply(Math,list[game].achievement.list.filter(ach => ach.Achieved && ach.UnlockTime > 0).map((ach) => { return ach.UnlockTime }));
        
        let template = `
        <li>
            <div class="game-box" data-index="${game}" data-appid="${list[game].appid}" data-time="${(timeMostRecent > 0) ? timeMostRecent : 0}" ${(list[game].system) ? `data-system="${list[game].system}"` : ''}>
              <div class="header" style="background: url('${list[game].img.header}');"></i></div>
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
          
          if (!self.data("system")) {
            menu.append(new MenuItem({type: 'separator'}));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "Steam", click() {shell.openExternal(`https://store.steampowered.com/app/${appid}/`)} }));
            menu.append(new MenuItem({ icon: nativeImage.createFromPath(path.join(appPath,"resources/img/globe.png")), label: "SteamDB", click() {shell.openExternal(`https://steamdb.info/app/${appid}/`)} }));
          }

         menu.popup({ window: win });
         
       });
      
      if (self.args.appid) $(`#game-list .game-box[data-appid="${self.args.appid.toString().replace(/[^\d]/g, '')}"]`).first().trigger("click");

      sort(elem,sortOptions());
   
   }).catch((err) => {
      debug.log(err);
   }).finally(() => {
      $("#user-info").fadeTo('fast', 1).css("pointer-events","initial");
      $("#sort-box").fadeTo('fast', 1).css("pointer-events","initial");
      $("#win-settings").css("pointer-events","initial");
   });

  },
  onGameBoxClick: function(self,list){
        self.css("pointer-events","none");

        let game = list.find( elem => elem.appid == self.data("appid") && list.indexOf(elem) == self.data("index"));

        $("#home").fadeOut(function() {
            
            if(game.img.background) {

              if (game.system === "uplay") {
                let gradient = `linear-gradient(to bottom right, rgba(0, 47, 75, .8), rgba(35, 54, 78, 0.9))`;
                $("body").fadeIn().attr("style",`background: ${gradient}, url('${game.img.background}')`);
              } else {
                $("body").fadeIn().css("background",`url('${game.img.background}')`);
              }
              
            } else {
              $("body").fadeIn();
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
            
            $("#unlock > .header .sort-ach .sort.time").removeClass("active");
            let unlock = $("#unlock ul");
            let lock = $("#lock ul");
            unlock.empty();
            lock.empty();
            
            let hidden_counter = 0;

            let i = 0;
            for (let achievement of game.achievement.list) {

                let template = `
                <li>
                      
                         <div class="achievement" data-name="${achievement.name}" data-index="${i}">
                            <div class="icon" style="background: url('${achievement.Achieved ? achievement.icon : achievement.icongray}');"></div>
                            <div class="content">
                                <div class="title">${game.system === "playstation" ? `<i class="fas fa-trophy" data-type="${achievement.type}"></i> ${achievement.displayName}` : `${achievement.displayName}`}</div>
                                <div class="description">${achievement.description || ''}</div>
                                <div class="progressBar" data-current="${achievement.CurProgress || '0'}" data-max="${achievement.MaxProgress || '0'}">
                                <span class="meter" style="width:${(achievement.MaxProgress > 0) ? `${Math.round((achievement.CurProgress / achievement.MaxProgress ) * 100)}` : '0'}%"></span></div>
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
                  } else {
                    lock.append(template);
                  }

                }
            
            }
            
            let count_unlocked = game.achievement.list.filter( elem => elem.Achieved).length; /*can replace by value on header which were calculated parse etc already*/
            let count_locked = game.achievement.list.length - count_unlocked;
            
            $("#unlock .header .title").attr("data-count",count_unlocked);
            $("#lock .header .title").attr("data-count",count_locked);
            
            if ( count_unlocked == 0) {
              
              let template = `
              <li>
                <div class="notice">${$("#unlock").data("lang-noneUnlocked")} <i class="fas fa-frown-open"></i> ${$("#unlock").data("lang-play")}</div>
              </li>`;
              unlock.append(template);
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
                      </div> 
                 </li>
            `;
            
            if (hidden_counter > 0) {
              lock.append(hidden_template);
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