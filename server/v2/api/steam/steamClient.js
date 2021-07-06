import path from "path";
import zlib from "zlib";
import { promisify } from 'util';
import Steam from "steam";
import Schema from "steam-resources";
import vdf from "@node-steam/vdf";
import request from "request-zero";
import * as fs from "@xan105/fs";

import { require } from "../../util/esm.js";
const { folder } = require("./config.json");
const { steam : { account : credentials } } = require("./key.json");

export default async function productInfoRequest(appID, onlyGame = true){
  
  console.log("productInfoRequest");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  
  const filepath = path.join(folder.cache,`steam/appInfo/${appID}.json`);
  
  let result;
  
  if (await fs.existsAndIsYoungerThan(filepath,{timeUnit: 'M', time: 1})) 
  {
    result = JSON.parse(await fs.readFile(filepath));
  }
  else 
  {
    try
    {
       const url = await clientPICSProductInfoRequest(appID);
       const data = await getAppInfo(url);
       
       if (onlyGame === true && data.common.type !== "Game") throw "ENOGAME";
       
       fs.writeFile(filepath,JSON.stringify(data, null, 2)).catch(()=>{});
       result = data;
    }
    catch(err)
    {
      console.error(err);
      if (await fs.exists(filepath))
      {
        result = JSON.parse(await fs.readFile(filepath));
      } 
      else 
      {
        throw err;
      }
    }
  }
  
  return result;
}

export function findBinary(launchOptions){

  console.log("findBinary");
  
  let binary;
  
  try{
  
    const options = Object.entries(launchOptions).map(([key, value])=>{ return value });
  
    if (options.length === 1) 
    {
      binary = options[0].executable.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0];
    } 
    else 
    {
      
      const filteredLaunchOptions = options.filter((launch) => { 

        if (launch.config?.betakey) return false;
        if (!launch.config?.oslist || launch.config?.oslist === "windows") return true;
        return false;
      });
          
      for (let launch of filteredLaunchOptions)
      { 
        binary = launch.executable.match(/([^\\\/\:\*\?\"\<\>\|])+$/)[0];
        if (launch.type === "default") break;
      }
    }
  
  }catch(err){
    console.warn(err);
    /*Do nothing*/
  }

  console.log("found binary: " + binary);
  return binary;
}

async function getAppInfo(url){

  console.log("getAppInfo");

  const { path : filepath } = await request.download(url, folder.temp);
  const buffer = await promisify(zlib.gunzip)(await fs.readFile(filepath));
  const data = buffer.slice(0, buffer.length - 2 ).toString("utf8"); //Remove EOL: 0a00
  
  let {appinfo : manifest } = vdf.parse(data);
  manifest.lastUpdated = Date.now();
  
  fs.rm(filepath).catch(()=>{});
  return manifest;
}

function clientPICSProductInfoRequest (appID){
  
  console.log("clientPICSProductInfoRequest");
  
  return new Promise((resolve, reject) => {
    
    if (!appID || !(Number.isInteger(appID) && appID > 0)) return reject("EINVALIDAPPID");
    
    const client = new Steam.SteamClient();
    const user = new Steam.SteamUser(client);
    
    client.connect();
    client
      .on('connected', function() {
        user.logOn({account_name: credentials[0].name, password: credentials[0].password });
      })
      .on('logOnResponse', function(logonResp) { 
      if (logonResp.eresult == Steam.EResult.OK) 
      {
        let ProductInfo = new Schema.Internal.CMsgClientPICSProductInfoRequest({ meta_data_only: true, num_prev_failed: 0});
        ProductInfo.apps[0] = new Schema.Internal.CMsgClientPICSProductInfoRequest.AppInfo({ appid: appID, access_token: 0 });
        
        client.send(
          { msg: Steam.EMsg.ClientPICSProductInfoRequest, proto: {} },
          ProductInfo.toBuffer(),
          (header,body) => {
            const res = new Schema.Internal.CMsgClientPICSProductInfoResponse.decode(body);
            
            if (res.apps.length === 0) 
            {
              reject("EAPPIDNOTFOUND");
            } 
            else 
            {
              const sha = res.apps[0].sha.flip().toHex(15,35); //byteBuffer
              
              const url = "http://" + res.http_host + "/appinfo/" + appID + "/sha/" + sha + ".txt.gz";
              resolve(url);
            }
            
            client.disconnect(); 
        });
        
      } else {
        reject("Login failed");
        client.disconnect();
      }
      })
      .on("error", function() { 
        reject("Connection closed by the Steam server");
      })
      .on("loggedOff", function (EResult){ //Logged in elsewhere
        reject(EResult);
        client.disconnect();
      });

  });
}