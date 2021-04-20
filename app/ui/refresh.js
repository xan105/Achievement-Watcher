"use strict";

(function($, window, document) {
  $(function() {

    $(document).keydown(function(e) {
      if( (e.ctrlKey && e.which === 82) || e.which === 116) { //CTRL+R or F5
        e.preventDefault();
        resetUI();
      }
    });

  });
}(window.jQuery, window, document));

function resetUI(){
  if( $("#achievement").is(":visible")) $("#btn-previous").trigger( "click" );
  $("#settings").hide();
  $("#game-list ul").empty();
  $("#game-list .loading .progressBar").attr("data-percent",0);
  $("#game-list .loading .progressBar > .meter").css("width","0%");
  $("title-bar")[0].inSettings = false;
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
}