import request from "request-zero";
import htmlParser from "node-html-parser";

export async function getDataFromSteamStore(appID){

  console.log("getDataFromSteamStore");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";

  const url = `https://store.steampowered.com/app/${appID}`;
  
  const { body }  = await request(url,{ headers: 
    { 
      'Cookie': "birthtime=662716801; wants_mature_content=1; path=/; domain=store.steampowered.com", //Bypass age check and mature filter
      "Accept-Language" : "en-US;q=1.0" //force result to english
    } 
  }); 
     
  const html = htmlParser.parse(body);

  const result = {
    name: html.querySelector('.apphub_AppName').innerHTML,
    icon: html.querySelector('.apphub_AppIcon img').attributes.src.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0].replace(".jpg","")
  };
     
  return result;   
}

export async function getDataFromSteamStoreAPI(appID){

  console.log("getDataFromSteamStoreAPI");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  const url = `https://store.steampowered.com/api/appdetails?appids=${appID}`;
    
  const res = await request.getJson(url,{headers: {"Accept-Language" : "en-US;q=1.0"}});

  if(res[appID].success) 
  {
    const result = { name: res[appID].data.name };
    return result;
  } 
  else 
  {
     throw "ENODATA"; //Game is probably no longer on sale
  }

}

export default async function getDataFromSteamStoreFallbackStoreAPI(appID){
  
  console.log("getDataFromSteamStoreFallbackStoreAPI");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  let result;
  
  try{
    result = await getDataFromSteamStore(appID);
  }catch{
    result = await getDataFromSteamStoreAPI(appID);
  }
  
  return result;

}