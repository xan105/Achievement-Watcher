/*
MIT License

Copyright (c) 2019-2020 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";

const util = require('util');
const { exec } = require('child_process');

module.exports = async(search = {}) => { //search by string or {name: , id:}

  try {

      const ps = await util.promisify(exec)(`powershell -NoProfile "${cmd(search,true)}"`,{windowsHide: true});
      if (ps.stderr) throw ps.stderr;

      const output = ps.stdout.split("\r\n\r\n").filter(line => line != ""); //Filter out blank space
      
      const result = output.map((line) => { 
        
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

module.exports.has = async (search = {}) => { //search by string or {name: , id:}

  const ps = await util.promisify(exec)(`powershell -NoProfile "${cmd(search,false)}"`,{windowsHide: true});
  if (ps.stderr) throw ps.stderr;

  const output = ps.stdout.split("\r\n\r\n").filter(line => line != ""); //Filter out blank space
    
  const isEmpty = (obj) => { 
   for (let x in obj) { return false; }
   return true;
  }; 
    
  if (typeof search === 'string' || isEmpty(search)) {
      if (!search) return false;
      for (let item of output) { if (item.includes(`${search}`)) return true }
      return false; 
  } 
  else 
  {
      if (output.length > 0) 
      {
        return true
      } else {
        return false;
      }
  }
}

module.exports.isValidAUMID = (appID) => { // Check if appID is a valid UWP Application User Model ID
  
  if (typeof appID !== 'string') throw "appID must be a string";

  appID = appID.trim();

  if ( appID.length > 128 || appID.includes(" ") || !appID.includes("!")) return false;

  const [familyname] = appID.split("!");

  if(!familyname.includes("_")) return false;

  const [name] = familyname.split("_");

  const sections = name.split(".");

  if (sections.length > 4 || sections.length  < 2 ) return false 

  return true;
}

function cmd(search,list = true){

  const format = (list) ? "Format-List" : "format-table -HideTableHeaders"; 
    
  let cmd;
  if (typeof search === 'string') {
    cmd = `Get-StartApps | ${format}`;
  } else if (search && search.name && search.id) {
    cmd = `Get-StartApps "${search.name}" | Where-Object {$_.AppID -match '.*${search.id}.*' } |${format}`;
  } else if (search && search.name){
    cmd = `Get-StartApps "${search.name}" | ${format}`;
  } else if (search && search.id) {
    cmd = `Get-StartApps | Where-Object {$_.AppID -match '.*${search.id}.*' } | ${format}`;
  } else {
    cmd = `Get-StartApps | ${format}`;
  }
    
  return cmd;
  
}