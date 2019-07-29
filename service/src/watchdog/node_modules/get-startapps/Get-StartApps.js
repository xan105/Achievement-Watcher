const util = require('util');
const { exec } = require('child_process');

module.exports = async(search = {}) => { //search by string or {name: , id:}
  
  try {
      
      let cmd;
      if (typeof search === 'string') {
        cmd = `Get-StartApps | Format-List`;
      } else if (search.name && search.id) {
        cmd = `Get-StartApps "${search.name}" | Where-Object {$_.AppID -match '.*${search.id}.*' } | Format-List`;
      } else if (search.name){
        cmd = `Get-StartApps "${search.name}" | Format-List`;
      } else if (search.id) {
        cmd = `Get-StartApps | Where-Object {$_.AppID -match '.*${search.id}.*' } | Format-List`;
      } else {
        cmd = "Get-StartApps | Format-List";
      }

      let ps = await util.promisify(exec)(`powershell "${cmd}"`,{windowsHide: true});
      
      let output = ps.stdout.split("\r\n\r\n"); 
      output = output.filter(line => line != ""); //Filter out blank space
      
      let result = output.map((line) => { 
        
        let col = line.split("\r\n");
        return {
          name: col[0].replace("Name  :",""),
          appid: col[1].replace("AppID :","")
        }
        
      });
    
      if (typeof search === 'string') {
        return result.filter(item => item.name.includes(search) || item.appid.includes(search));
      } else {
        return result;
      }

  }catch(err){
      return [];
  }

}

module.exports.has = async(search = {}) => { //search by string or {name: , id:}
  try{
  
      let cmd;
      if (typeof search === 'string') {
        cmd = `Get-StartApps | format-table -HideTableHeaders`;
      } else if (search.name && search.id) {
        cmd = `Get-StartApps "${search.name}" | Where-Object {$_.AppID -match '.*${search.id}.*' } | format-table -HideTableHeaders`;
      } else if (search.name){
        cmd = `Get-StartApps "${search.name}" | format-table -HideTableHeaders`;
      } else if (search.id) {
        cmd = `Get-StartApps | Where-Object {$_.AppID -match '.*${search.id}.*' } | format-table -HideTableHeaders`;
      } else {
        return false;
      }
      
      cmd = `Get-StartApps | Where-Object {$_.AppID -match '.*${search}.*' } | format-table -HideTableHeaders`;
      let ps = await util.promisify(exec)(`powershell "${cmd}"`,{windowsHide: true});
      
      let output = ps.stdout.split("\r\n");
      let result = output.filter(line => line != ""); //Filter out blank space

      if (typeof search === 'string') {
          for (item of result) {
            if (item.includes(`${search}`)) return true;
          }
          return false; 
      } else {
          if (result.length > 0) {
            return true
          } else {
            return false;
          }
      } 

  }catch(err){
    return false;
  }

}
