'use strict';

const fs = require('fs');
const path = require('path');
const regedit = require('regodit');
const accountms = require('accountpicture-ms-extractor');

async function imageFileToBase64(filePath){
	const ext = path.parse(filePath).ext.replace(".","");
	const buffer = await fs.promises.readFile(filePath);
	const base64 = `data:image/${ext};charset=utf-8;base64,${buffer.toString('base64')}`;
	return base64;
}

async function getWindowsProfileAvatar(){
    
  const sourceID = await regedit.promises.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/AccountPicture","SourceId");
  if (!sourceID) throw "No source ID found";
      
  const file = path.join(process.env["APPDATA"],"Microsoft/Windows/AccountPictures",`${sourceID}.accountpicture-ms`);
  const windowsProfileAvatar = await accountms(file);
      
  const avatar = {
	highres : `data:image/${windowsProfileAvatar.type};charset=utf-8;base64,${windowsProfileAvatar.highres.toString('base64')}`,
	lowres : `data:image/${windowsProfileAvatar.type};charset=utf-8;base64,${windowsProfileAvatar.lowres.toString('base64')}`
  }; 

  return avatar.highres;   
}

async function getAvatar(){
	let avatar = localStorage.getItem("avatar");
	if(!avatar) avatar = await getWindowsProfileAvatar();
    return avatar;
}

module.exports = { getAvatar, imageFileToBase64 }