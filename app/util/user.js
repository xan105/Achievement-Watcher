"use strict";

const os = require('os');
const accountms = require('accountpicture-ms-extractor');
const regedit = require("../native/regedit/regedit.js");

module.exports.get = () => {
  return new Promise((resolve) => {

    const sourceID = regedit.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/AccountPicture","SourceId");

    let result = {
      avatar: null,
      name: os.userInfo().username || "User"
    };

    if (!sourceID) return resolve(result);
    
    const file = path.join(process.env["APPDATA"],"Microsoft/Windows/AccountPictures",`${sourceID}.accountpicture-ms`);

    accountms(file).then((extracted) => {  
        result.avatar = `data:image/${extracted.type};charset=utf-8;base64,${extracted.small.toString('base64')}`;
    }).catch((err) => {
        //Do nothing
    }).finally(() => {
        return resolve(result);
    }); 
  });
}