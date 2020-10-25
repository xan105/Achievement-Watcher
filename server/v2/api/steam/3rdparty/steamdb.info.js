/*
As stated in the SteamDB faq page (https://steamdb.info/faq) 
There's a chance you'll get automatically banned for scraping the SteamDB.
You should instead use the method(s) found in 'steam_client.js' which use a port of SteamKit in js (node-steam);
Which is basically how the SteamDB interfaces with the Steam network.
Use the following method(s) with caution and as a last resort. 
*/

import request from "request-zero";
import htmlParser from "node-html-parser";

export default async function getDataFromSteamDB(appID){
  
  console.log("getDataFromSteamDB");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  const url = `https://steamdb.info/app/${appID}`;
  
  const { body } = await request(url);
  
  const html = htmlParser.parse(body);
  
  let result = {
    name: html.querySelector('.pagehead h1').innerHTML,
    icon: html.querySelector('.pagehead .app-icon.avatar').attributes.src.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0].replace(".jpg","")
  };

  for (let elem of html.querySelectorAll("#config .launch-option")) 
  {
    const windows = ( elem.querySelector(".octicon-windows") || ( !elem.querySelector(".octicon-macos") && !elem.querySelector(".octicon-linux")) ) ? true : false;
    if(windows) result.binary = elem.querySelector("code").innerHTML.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0]; 
  }
  
  return result;
}