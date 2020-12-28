'use strict';

const path = require('path');
const regedit = require('regodit');

module.exports.getDefault = () => {

  const _default_ = "Windows Notify System Generic.wav";
  
  try{
  
    const filepath = regedit.RegQueryStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Default/.Current","");
  
    if(filepath) {
  
      return path.parse(filepath).base;
      
    } else { return _default_ }
  
  }catch{ return _default_ }
}

module.exports.setCustom = (filename) => {
  try{
  
    const file = path.join(process.env['WINDIR'],"Media",filename);
    
    regedit.RegWriteStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Current","",file);
    regedit.RegWriteStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Default","",file);
  
  }catch{/*Do nothing*/}
}

module.exports.getCustom = () => {
  try{
  
    const filepath = regedit.RegQueryStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Current","");
  
    if(filepath) {
  
      return path.parse(filepath).base;
      
    } else { return "" }
  
  }catch{ return "" }
}