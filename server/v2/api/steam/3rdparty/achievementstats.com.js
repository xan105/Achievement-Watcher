import path from "path";
import request from "request-zero";
import * as fs from "@xan105/fs";

import { require } from "../../../util/esm.js";
const { folder } = require("./config.json");
const { misc: { achievementstats : apiKey }  } = require("./key.json");

export default async function getHiddenDescriptionFromCacheOrRemote(appID){

  console.log("getHiddenDescriptionFromCacheOrRemote");
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";

  const filepath = path.join(folder.cache,"steam/schema/english/hidden_desc",`${appID}.json`);
  
  let result;
  
  if (await fs.existsAndIsYoungerThan(filepath,{timeUnit: 'M', time: 1})) 
  {
    
    console.log("> from cache");
    
    result = JSON.parse(await fs.readFile(filepath));
  }
  else 
  {
    try
    {
      
      console.log("> from remote");
      
      const url = `https://api.achievementstats.com/games/${appID}/achievements/?key=${apiKey}`;

      const data = await request.getJson(url); //when busy return string. json parse failure
      
      if (!data) throw "EUNEXPECTEDNODATA";
       
      result = []; 
       
      for (let achievement of data)
      {
        result.push({
          apiName: achievement.apiName,
          description: achievement.description
        });
      }
      
      if (result.length === 0) throw "EUNEXPECTEDEMPTY"; 
       
      fs.writeFile(filepath,JSON.stringify(result, null, 2)).catch(()=>{});
    }
    catch(err)
    {
      if (await fs.exists(filepath))
      {
        console.log("> fallback to previous data");
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
