const path = require('path');
const regedit = require('regodit');

module.exports.getDefault = () => {

  try{
  
    let filepath = regedit.RegQueryStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Default/.Current","");
  
    if(filepath) {
  
      return (path.parse(filepath)).base;
      
    } else {
      return "Windows Notify System Generic.wav";
    }
  
  }catch(err){
    return "Windows Notify System Generic.wav";
  }

}

module.exports.setCustom = (filename) => {

  try{
  
    let file = path.join(process.env['WINDIR'],"Media",filename);
    
    regedit.RegWriteStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Current","",file);
    regedit.RegWriteStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Default","",file);
  
  }catch(err){}

}

module.exports.getCustom = () => {

  try{
  
    let filepath = regedit.RegQueryStringValue("HKCU","AppEvents/Schemes/Apps/.Default/Notification.Achievement/.Current","");
  
    if(filepath) {
  
      return (path.parse(filepath)).base;
      
    } else {
      return "";
    }
  
  }catch(err){
    return "";
  }

}