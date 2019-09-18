"use strict";

const { remote } = require('electron');
const ffs = require(path.join(appPath,"util/feverFS.js"));

const langDir = path.join(appPath,"locale/lang");
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

module.exports.load = async (lang = "english") => {
    try {
    
      if (!steamLanguages.some(language => language.api === lang)) lang = "english";

      let english = JSON.parse(await ffs.promises.readFile(path.join(langDir,"english.json"),"utf8"));
      let template;
      try {
        if (lang != "english") {
          let requested = JSON.parse(await ffs.promises.readFile(path.join(langDir,`${lang}.json`),"utf8"));
          template = Object.assign(english,requested);
        } else {
          template = english;
        }
      }catch(err){
        template = english;
      }
    
      let locale = steamLanguages.find(language => language.api === lang).webapi;
    
      if(template) {
        translateUI(lang,locale,template);
      } else {
        throw("Unexpected Error");
      }
      
      return locale;
      
    }catch(err){
      throw err;
    }
}

function translateUI(lang,locale,template){
  (function($, window, document) {
      $(function() {      
      
        let selector = $("#option_lang");
        selector.empty();
        for (let language of steamLanguages) {
            selector.append(`<option value="${language.api}" data-tooltip="${language.native}" title="${language.displayName}" ${language.api === lang ? "selected": ""}>${language.native}</option>`);   
        }

        $("html").attr("lang",`${locale.slice(0,2).toLowerCase()}`);
        
        selector = $("#user-info .info .stats");
        selector.find("li:nth-child(1) span:eq(1)").text(clear(template.achievements));
        selector.find("li:nth-child(2) span:eq(1)").text(clear(template.perfectGame));
        selector.find("li:nth-child(3) span:eq(1)").text(clear(template.completionRate));
        selector = $("#game-list");
        selector.attr("data-contextMenu0",clear(template.removeFromList));
        selector.find(".isEmpty span").text(clear(template.emptyList));
        selector.find(".loading .title").text(clear(template.loading));
        $("#btn-previous").text(clear(template.allGamesBackButton));
        $("#unlock .header .title span").text(clear(template.unlocked));
        $("#lock .header .title span").text(clear(template.locked));
        $("#achievement .achievements").data("lang-globalStat",clear(template.globalStat));
        $("#lock").data("lang-title",clear(template.hiddenRemain));
        $("#lock").data("lang-message",clear(template.revealedOnceUnlocked));
        $("#unlock").data("lang-noneUnlocked",clear(template.noneUnlocked));
        $("#unlock").data("lang-play",clear(template.play));
        $("#btn-scrollup span").text(clear(template.scrollUp));
        $("#settings .box .header span").text(clear(template.settings));
        selector = $("#options-ui");
        selector.find("li:nth-child(1) .left span").text(clear(template.language));
        selector.find("li:nth-child(1) .help span").text(clear(template.helpTranslate[0]));
        selector.find("li:nth-child(1) .help a").text(clear(template.helpTranslate[1]));
        selector.find("li:nth-child(2) .left span").text(clear(template.hiddenAch));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.show));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.hide));
        selector.find("li:nth-child(3) .left span").text(clear(template.mergeDuplicates));
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(4) .left span").text(clear(template.hideZero));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(5) .left span").text(clear(template.legitSteam));
        selector.find("li:nth-child(5) .right select option[value='0']").text(clear(template.none));
        selector.find("li:nth-child(5) .right select option[value='1']").text(clear(template.installed));
        selector.find("li:nth-child(5) .right select option[value='2']").text(clear(template.owned));
        selector.find("li:nth-child(5) .help").text(clear(template.publicProfile));
        selector = $("#options-notify");
        selector.find("li:nth-child(1) .left span").text(clear(template.notification));
        selector.find("li:nth-child(1) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(1) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(1) .help").text(clear(template.notificationDescription));
        selector.find("li:nth-child(2) .left span").text(clear(template.souvenir));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(2) .help").text(clear(template.souvenirDescription));
        selector.find("li:nth-child(3) .left span").text(clear(template.toastSouvenir));
        selector.find("li:nth-child(3) .right select option[value='0']").text(clear(template.hide));
        selector.find("li:nth-child(3) .right select option[value='1']").text(clear(template.toastSouvenir_header));
        selector.find("li:nth-child(3) .right select option[value='2']").text(clear(template.toastSouvenir_footer));
        selector.find("li:nth-child(3) .help").text(clear(template.toastSouvenirDescription));
        selector.find("li:nth-child(4) .left span").text(clear(template.showDesc));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(4) .help").text(clear(template.showDescDescription)); 
        selector.find("li:nth-child(5) .left span").text(clear(template.customToastAudio));
        selector.find("li:nth-child(5) .right select option[value='0']").text(clear(template.muted));
        selector.find("li:nth-child(5) .right select option[value='1']").text(clear(template.systemDefault));
        selector.find("li:nth-child(5) .help").text(clear(template.customToastAudioDescription));        
        selector.find("li:nth-child(6) .left span").text(clear(template.powershell));
        selector.find("li:nth-child(6) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(6) .right select option[value='false']").text(clear(template.disable));
        selector.find("li:nth-child(6) .help").text(clear(template.powershellDescription));
        selector.find("li:nth-child(7) .left span").text(clear(template.gntp));
        selector.find("li:nth-child(7) .right select option[value='true']").text(clear(template.enable));
        selector.find("li:nth-child(7) .right select option[value='false']").text(clear(template.disable));   
        selector = $("#settings .box .footer .notice p:nth-child(1)");
        selector.find("span:eq(0)").text(clear(template.version));
        selector.find("span:eq(1)").text(clear(remote.app.getVersion()));
        $("#btn-settings-cancel").text(clear(template.cancel));
        $("#btn-settings-save").text(clear(template.save));
        $("#settingNav li[data-view='general'] span").text(clear(template.general));
        $("#settingNav li[data-view='notification'] span").text(clear(template.notification));
        $("#settingNav li[data-view='folder'] span").text(clear(template.folder));
        $("#settingNav li[data-view='advanced'] span").text(clear(template.advanced));
        selector = $("#settings .box .content[data-view='folder']");
        selector.find(".disclaimer span").text(clear(template.dirDisclaimer));
        selector.find(".title:eq(0) span").text(clear(template.dirDefault));
        selector.find(".title:eq(1) span").text(clear(template.dirCustom));
        $("#addCustomDir span").text(clear(template.dirAdd));
        $("#settings .content[data-view='folder'] > .controls .info p").html(clear(template.customUserFolderInfo.join("\n")).replace(/\n/g,"<br>")); 
        $("#settings .content[data-view='advanced'] ul:first-child li:first-child").text(clear(template.blacklistTitle));
        $("#blacklist_reset span").text(clear(template.blacklistButton));
        $("#blacklist_reset ~ div").text(clear(template.blacklistInfo));
      });
   }(window.jQuery, window, document));  
}

function clear(str) {
  if(str){
    str = str.toString();
    return str.replace(/<\/?[^>]+>/gi, ''); 
  } 
}