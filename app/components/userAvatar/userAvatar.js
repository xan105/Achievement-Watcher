'use strict';

const { remote } = require('electron');
const fs = require('fs');
const path = require('path');
const regedit = require('regodit');
const accountms = require('accountpicture-ms-extractor');

const template = `

  <style>
  
    :host { 
		background: url(../resources/img/avatar.png);
		background-color: #27374a;
		background-repeat: no-repeat !important;
		background-size: cover !important;
		background-position: center !important;
		width: 96px;
		height: 96px; 
		border: solid white 2px;
		margin: 10px;
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    
    :host(:hover) {
		cursor: pointer;
		box-shadow: rgba(198, 212, 223, 0.5) 0px 0px 8px 2px;
		color: #d9dfe4;

	}
    
    :host(.round) {
		border-radius: 50%;
    }
  
  </style>

`;

async function imageFileToBase64(filePath){
	const ext = path.parse(filePath).ext;
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

export default class titleBar extends HTMLElement {
    constructor() {
		super();

		this.attachShadow({mode: 'open'}).innerHTML = template;

    }
    
    /* Life Cycle */
    connectedCallback() {
		this.addEventListener('click', this.onClick.bind(this));
		this.addEventListener('contextmenu', this.onContextmenu.bind(this), false);
		
		(localStorage["avatarSquared"] == true) ?  this.classList.remove("round") : this.classList.add("round");
		
		this.update();
    } 
    
    disconnectedCallback() {
		this.removeEventListener('click', this.onClick.bind(this));
		this.removeEventListener('contextmenu', this.onContextmenu.bind(this), false);
    }
    
    /* Custom method */
    
    update(){
		const self = this;
		
		getAvatar().then((avatar) => {
			self.style["background"] = `url(${avatar})`;
		}).catch(()=>{});
    }
    
    async onClick() {
		const self = this;
		self.style["pointer-events"] = "none";
		
		try{
			const dialog = await remote.dialog.showOpenDialog({
				properties: ['openFile', 'showHiddenFiles', 'dontAddToRecent'], filters: [
				  { name: 'Image', extensions: ['jpeg', 'jpg', 'png', 'gif', 'bmp'] },
				]
			 });
			 
			if (dialog.canceled) { 
				self.style["pointer-events"] = "initial";
				return; 
			}
			
			const avatar = await imageFileToBase64(dialog.filePaths[0]);
			localStorage.setItem("avatar", avatar);
			self.update();
		}catch(err){
			remote.dialog.showMessageBoxSync({ type: "error", title: "Unexpected Error", message: "Failed to set avatar.", detail: `${err}` });
		}
		
		self.style["pointer-events"] = "initial";
    } 
    
    onContextmenu(e){
    
		e.preventDefault();
		
		const self = this;
		
		const { Menu, MenuItem, nativeImage } = remote;
		const menu = new Menu();
		
		menu.append(new MenuItem({ label: 'Reset to default avatar', click() { 
			localStorage.removeItem("avatar");
			self.update();
		} }));
		
		menu.append(new MenuItem({ label: 'Squared', type: 'checkbox', checked: !self.classList.contains('round'), click(menuItem, browserWindow, event) { 
			const status = self.classList.toggle("round"); 
			localStorage.setItem("avatarSquared", !status);
		} }));
		
		menu.popup({ window: remote.getCurrentWindow() });
    }
}