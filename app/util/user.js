"use strict";

const os = require('os');
const accountms = require('accountpicture-ms-extractor');
const regedit = require('regodit');

module.exports.get = async (highres = false) => {
  
  let result = {
      avatar: null,
      name: os.userInfo().username || "User"
  };
  
  try{
    const sourceID = await regedit.promises.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/AccountPicture","SourceId");
    if (!sourceID) throw "No source ID found";
    
    const file = path.join(process.env["APPDATA"],"Microsoft/Windows/AccountPictures",`${sourceID}.accountpicture-ms`);
    const avatarPicture = await accountms(file);
    
    if(highres){
      result.avatar = `data:image/${avatarPicture.type};charset=utf-8;base64,${avatarPicture.big.toString('base64')}`;
    } else {
      result.avatar = `data:image/${avatarPicture.type};charset=utf-8;base64,${avatarPicture.small.toString('base64')}`;
    }

  }catch{}
  
  return result;
}
