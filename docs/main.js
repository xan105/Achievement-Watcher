'use strict';

import request from './request-fetch.js';

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(()=>{ 

  const url = "https://api.github.com/repos/xan105/achievement-watcher/releases/latest";
  const name = "Achievement.Watcher.Setup.exe"

  request(url, {headers: {"Accept" : "application/vnd.github.v3+json"}} ).then((data)=>{
  
    let github = {};
    try{
      github = JSON.parse(data.body);
      
      let asset = github.assets.find( asset => asset.name === name);
      
      document.getElementById("btn-download").href = asset.browser_download_url;

    }catch(err){
      //do nothing
    }
  }).catch((err)=>{
    //do nothing
  });

  [...(document.querySelectorAll('.contextmenu'))].forEach((el)=>{ el.oncontextmenu=(e)=>{e.preventDefault()}; });
  document.querySelector('#back-to-top').addEventListener('click', ()=>{ window.scroll({top: 0, left: 0, behavior: 'smooth'}) });
  
});