"use strict";

const { remote } = require('electron');
const merge = require('deepmerge')
const ffs = require("@xan105/fs");

const langDir = path.join(appPath,"locale/lang");
const steamLanguages = require(path.join(appPath,"locale/steam.json"));

module.exports.load = async (lang = "english") => {
    try {
    
      if (!steamLanguages.some(language => language.api === lang)) lang = "english";   

      let english = JSON.parse(await ffs.readFile(path.join(langDir,"english.json"),"utf8"));
      let template;
      try {
        if (lang != "english") {
          let requested = JSON.parse(await ffs.readFile(path.join(langDir,`${lang}.json`),"utf8"));
          template = merge(english,requested,{ arrayMerge: (dest, src, options) => src, //Do not concatenate array
                                               isEmpty: a => a === null || a === '' //Ignore empty or null value
                                             });
        } else {
          template = english;
        }
      }catch(err){
        console.warn(err);
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
        let selector = $("#option_lang");
        selector.empty();
        for (let language of steamLanguages) {
            selector.append(`<option value="${language.api}" data-tooltip="${language.native}" title="${language.displayName}" ${language.api === lang ? "selected": ""}>${language.native}</option>`);   
        }

        $("html").attr("lang",`${locale.slice(0,2).toLowerCase()}`);
        
        selector = $("#game-list");
        selector.find(".loading .title").text(clear(template.loading));
        selector.find(".isEmpty span").text(clear(template.emptyList));
        selector.attr("data-contextMenu0",clear(template.removeFromList));
        selector.attr("data-contextMenu1",clear(template.buildIconPrefetchCache));
        selector = $("#user-info .info .stats");
        selector.find("li:nth-child(1) span:eq(1)").text(clear(template.achievements));
        selector.find("li:nth-child(2) span:eq(1)").text(clear(template.perfectGame));
        selector.find("li:nth-child(3) span:eq(1)").text(clear(template.completionRate));
        $("#btn-previous").text(clear(template.allGamesBackButton));
        $("#unlock .header .title span").text(clear(template.unlocked));
        $("#lock .header .title span").text(clear(template.locked));
        $("#achievement .achievements").data("lang-globalStat",clear(template.globalStat));
        $("#unlock").data("lang-noneUnlocked",clear(template.noneUnlocked));
        $("#unlock").data("lang-play",clear(template.play));
        $("#lock").data("lang-title",clear(template.hiddenRemain));
        $("#lock").data("lang-message",clear(template.revealedOnceUnlocked));
        $("#lock").data("lang-hidden",clear(template.settings.common.show));
        $("#btn-scrollup span").text(clear(template.scrollUp));
        $("#settings .box .header span").text(clear(template.settings.title));
        selector = $("#options-ui");
        selector.find("li:nth-child(1) .left span").text(clear(template.settings.general.language.name));
        selector.find("li:nth-child(1) .help span").text(clear(template.settings.general.language.description[0]));
        selector.find("li:nth-child(1) .help a").text(clear(template.settings.general.language.description[1]));
        selector.find("li:nth-child(2) .left span").text(clear(template.settings.general.thumbnail.name));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.settings.general.thumbnail.value.portrait));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.settings.general.thumbnail.value.landscape));
        selector.find("li:nth-child(3) .left span").text(clear(template.settings.general.hiddenAch.name));
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.settings.common.show));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.settings.common.hide));
        selector.find("li:nth-child(4) .left span").text(clear(template.settings.general.mergeDuplicates.name));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(5) .left span").text(clear(template.settings.general.timeMerge.name));
        selector.find("li:nth-child(5) .right select option[value='true']").text(clear(template.settings.general.timeMerge.value.recent));
        selector.find("li:nth-child(5) .right select option[value='false']").text(clear(template.settings.general.timeMerge.value.oldest));
        selector.find("li:nth-child(5) .help").text(clear(template.settings.general.timeMerge.description));
        selector.find("li:nth-child(6) .left span").text(clear(template.settings.general.hideZero.name));
        selector.find("li:nth-child(6) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(6) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector = $("#options-notify-common");
        selector.prev(".title").find("span").text(clear(template.settings.notification.title.common));
        selector.find("li:nth-child(1) .left span").text(clear(template.settings.notification.option.notification.name));
        selector.find("li:nth-child(1) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(1) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(1) .help").text(clear(template.settings.notification.option.notification.description));
        selector.find("li:nth-child(2) .left span").text(clear(template.settings.notification.option.souvenir.name));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(2) .help").text(clear(template.settings.notification.option.souvenir.description));
        selector.find("li:nth-child(3) .left span").text(clear(template.settings.notification.option.showDesc.name));
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(3) .help").text(clear(template.settings.notification.option.showDesc.description));
        selector.find("li:nth-child(4) .left span").text(clear(template.settings.notification.option.rumble.name));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(4) .help").text(clear(template.settings.notification.option.rumble.description)); 
        selector.find("li:nth-child(5) .left span").text(clear(template.settings.notification.option.notifyOnProgress.name));
        selector.find("li:nth-child(5) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(5) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(5) .help").text(clear(template.settings.notification.option.notifyOnProgress.description));
        selector.find("li:nth-child(6) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(6) .right select option[value='false']").text(clear(template.settings.common.disable));   
        selector = $("#options-notify-toast");
        selector.prev().prev(".title").find("span").text(clear(template.settings.notification.title.toast));
        selector.prev(".info").text(clear(template.settings.notification.info.toast));
        selector.find("li:nth-child(1) .left span").text(clear(template.settings.notification.option.customToastAudio.name));
        selector.find("li:nth-child(1) .right select option[value='0']").text(clear(template.settings.notification.option.customToastAudio.value.muted));
        selector.find("li:nth-child(1) .right select option[value='1']").text(clear(template.settings.notification.option.customToastAudio.value.systemDefault));
        selector.find("li:nth-child(1) .help").text(clear(template.settings.notification.option.customToastAudio.description));
        selector.find("li:nth-child(2) .left span").text(clear(template.settings.notification.option.toastSouvenir.name));
        selector.find("li:nth-child(2) .right select option[value='0']").text(clear(template.settings.common.hide));
        selector.find("li:nth-child(2) .right select option[value='1']").text(clear(template.settings.notification.option.toastSouvenir.value.top));
        selector.find("li:nth-child(2) .right select option[value='2']").text(clear(template.settings.notification.option.toastSouvenir.value.bottom));
        selector.find("li:nth-child(2) .help").text(clear(template.settings.notification.option.toastSouvenir.description));
        selector.find("li:nth-child(3) .left span").text(clear(template.settings.notification.option.groupToast.name));
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(3) .help").text(clear(template.settings.notification.option.groupToast.description));
        selector = $("#options-notify-transport");
        selector.prev(".title").find("span").text(clear(template.settings.notification.title.transport));
        selector.find("li:nth-child(1) .left span").text(clear(template.settings.notification.option.useToast.name));
        selector.find("li:nth-child(1) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(1) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(1) .help").text(clear(template.settings.notification.option.useToast.description));
        selector.find("li:nth-child(2) .left span").text(clear(template.settings.notification.option.useWinRT.name));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(2) .help").text(clear(template.settings.notification.option.useWinRT.description));
        selector.find("li:nth-child(3) .left span").text(clear(template.settings.notification.option.useBalloon.name));
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(3) .help").text(clear(template.settings.notification.option.useBalloon.description));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(4) .help").text(clear(template.settings.notification.option.useWS.description));
        selector.find("li:nth-child(5) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(5) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector = $("#settings .box .content[data-view='folder']");
        selector.find(".disclaimer span").text(clear(template.settings.folder.headline));
        selector.find(".title:eq(0) span").text(clear(template.settings.folder.default));
        selector.find(".title:eq(1) span").text(clear(template.settings.folder.custom));
        $("#addCustomDir span").text(clear(template.settings.folder.add));
        $("#settings .content[data-view='folder'] > .controls .info p").html(clear(template.settings.folder.addInfo.join("\n")).replace(/\n/g,"<br>")); 
        selector = $("#options-source");
        selector.find("li:nth-child(1) .left span").text(clear(template.settings.source.legitSteam.name));
        selector.find("li:nth-child(1) .right select option[value='0']").text(clear(template.settings.source.legitSteam.value.none));
        selector.find("li:nth-child(1) .right select option[value='1']").text(clear(template.settings.source.legitSteam.value.installed));
        selector.find("li:nth-child(1) .right select option[value='2']").text(clear(template.settings.source.legitSteam.value.owned));
        selector.find("li:nth-child(1) .help").text(clear(template.settings.source.legitSteam.description)); 
        selector.find("li:nth-child(2) .left span").text(clear(template.settings.source.steamEmu.name));
        selector.find("li:nth-child(2) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(2) .right select option[value='false']").text(clear(template.settings.common.disable)); 
        selector.find("li:nth-child(3) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(3) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(3) .help").text(clear(template.settings.source.greenLuma.description));
        selector.find("li:nth-child(4) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(4) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(4) .help").text(clear(template.settings.source.rpcs3.description));
        selector.find("li:nth-child(5) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(5) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(5) .help").text(clear(template.settings.source.lumaPlay.description));
        selector.find("li:nth-child(6) .left span").text(clear(template.settings.source.importCache.name));
        selector.find("li:nth-child(6) .right select option[value='true']").text(clear(template.settings.common.enable));
        selector.find("li:nth-child(6) .right select option[value='false']").text(clear(template.settings.common.disable));
        selector.find("li:nth-child(6) .help").text(clear(template.settings.source.importCache.description));
        $("#settings .content[data-view='advanced'] ul:first-child li:first-child").text(clear(template.settings.advanced.blacklistTitle));
        $("#blacklist_reset span").text(clear(template.settings.advanced.blacklistButton));
        $("#blacklist_reset ~ div").text(clear(template.settings.advanced.blacklistInfo));
        selector = $("#settings .box .footer .notice p:nth-child(1)");
        selector.find("span:eq(0)").text(clear(template.settings.common.version));
        selector.find("span:eq(1)").text(clear(remote.app.getVersion()));
        $("#settingNav li[data-view='general'] span").text(clear(template.settings.sideMenu.general));
        $("#settingNav li[data-view='notification'] span").text(clear(template.settings.sideMenu.notification));
        $("#settingNav li[data-view='folder'] span").text(clear(template.settings.sideMenu.folder));
        $("#settingNav li[data-view='source'] span").text(clear(template.settings.sideMenu.source));
        $("#settingNav li[data-view='advanced'] span").text(clear(template.settings.sideMenu.advanced));
        $("#settingNav li[data-view='debug'] span").text(clear(template.settings.sideMenu.debug));
        $("#btn-settings-cancel").text(clear(template.settings.common.cancel));
        $("#btn-settings-save").text(clear(template.settings.common.save));  
}

function clear(str) {
  if(str){
    str = str.toString();
    return str.replace(/<\/?[^>]+>/gi, ''); 
  } 
}