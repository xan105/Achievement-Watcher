import productInfoRequest from "./steamClient.js";
import { 
  getSteamGameInfoFromCacheOrRemote,
  getAchievementListFromCacheOrRemote,
  getUserAchievement,
  getServerGameIndex
} from "./steamWebApi.js";

import { require } from "../../util/esm.js";
const languages = require("./api/steam/languages.json");

export async function getSchema(appID,lang = "english"){
  
  console.log("getSchema:" + appID);
  
  if (!appID || !(Number.isInteger(appID) && appID > 0)) throw "EINVALIDAPPID";
  if (!languages.some( language => language.api === lang )) throw "EUNSUPPORTEDLANG";

  const achievementList = await getAchievementListFromCacheOrRemote(appID,lang);
  const metadata = await getSteamGameInfoFromCacheOrRemote(appID);
  
  const schema = Object.assign(metadata,{achievement: achievementList});
  
  console.log("-- SCHEMA DONE --");

  return schema;
}

export { productInfoRequest, getUserAchievement, getServerGameIndex };