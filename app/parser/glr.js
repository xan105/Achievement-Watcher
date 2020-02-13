"use strict";

const regedit = require('regodit');

module.exports.scan = async() => {
  try {
  
    let data = [];
    
    let glr = await regedit.promises.RegListAllSubkeys("HKCU","SOFTWARE/GLR/AppID");
      if (glr) {
        for (let key of glr) {
            
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
                
             }catch(e){
                //Do nothing
             }
        }
      } else {
        throw "GLR No achievement found in registry";
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