"use strict";

const regedit = require('regodit');

module.exports.scan = async() => {
  try {
  
    let data = [];

    const keys = {
      glr: await regedit.promises.RegListAllSubkeys("HKCU","SOFTWARE/GLR/AppID"),
      gl2020: await regedit.promises.RegListAllSubkeys("HKCU","SOFTWARE/GL2020/AppID")
    };

    if(keys.glr){
      for (let key of keys.glr) 
      {
        try {
          let glr_ach_enable = parseInt(await regedit.promises.RegQueryIntegerValue("HKCU",`SOFTWARE/GLR/AppID/${key}`,"SkipStatsAndAchievements"));
          if(glr_ach_enable === 0) {
               data.push({appid: key,
                          source: "GreenLuma Reborn",
                           data: {
                              type: "reg",
                              root: "HKCU",
                              path: `SOFTWARE/GLR/AppID/${key}/Achievements`}
                        });
               }
         }catch{}
       }
    }
    
    if(keys.gl2020){
      for (let key of keys.gl2020) 
      {
        try {
          let glr_ach_enable = parseInt(await regedit.promises.RegQueryIntegerValue("HKCU",`SOFTWARE/GL2020/AppID/${key}`,"SkipStatsAndAchievements"));
          if(glr_ach_enable === 0) {
               data.push({appid: key,
                          source: "GreenLuma 2020",
                           data: {
                              type: "reg",
                              root: "HKCU",
                              path: `SOFTWARE/GL2020/AppID/${key}/Achievements`}
                        });
               }
         }catch{}
       }
    }
    
    return data;
  
  }catch(err){
    throw err;
  }
}

module.exports.getAchievements = async (root,key) => {
  try {
  
    let achievements = await regedit.promises.RegListAllValues(root,key);
    if (!achievements) throw "No achievement found in registry";
    
    let result = [];
    
    for (let achievement of achievements){
      result.push({
        id: achievement,
        Achieved: parseInt(await regedit.promises.RegQueryIntegerValue(root,key,achievement)) 
      });
    }
    
    return result;   
  
  }catch(err){
    throw err;
  }
}