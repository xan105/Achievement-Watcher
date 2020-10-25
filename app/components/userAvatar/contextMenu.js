'use strict';

const { remote } = require('electron');
const { Menu, MenuItem, nativeImage } = remote;
const request = require('request-zero');

const { selectFileDialog } = require("./selectFileDialog.js");
const { getSteamPath, getSteamUsers } = require("../../parser/steam.js");

const appPath = remote.app.getAppPath();

function contextMenu(e, position = null){
    
	e.preventDefault();
	const self = this;
		
	const oldPosition = { x: e.pageX, y: e.pageY };

	const menu = new Menu();

	menu.append(new MenuItem({ 
		label: 'Squared', 
		type: 'checkbox', 
		checked: !self.classList.contains('round'), 
		click: function() { 
			const status = self.classList.toggle("round"); 
			localStorage.setItem("avatarSquared", !status);
		} 	
	  })
	);
		
	menu.append(new MenuItem({type: 'separator'}));
		
	menu.append(new MenuItem({ 
		icon: nativeImage.createFromPath(path.join(appPath,"resources/img/folder-open.png")),
		label: 'Browse...',
		click: function() { selectFileDialog.call(self) } 
	  })
	);
		
	menu.append(new MenuItem({ 
		icon: nativeImage.createFromPath(path.join(appPath,"resources/img/redo-alt.png")),
		label: 'Reset to default avatar',
		click: function() { 
			localStorage.removeItem("avatar");
			self.update();
		} 
	  })
	);
		
	menu.append(new MenuItem({type: 'separator'}));

	if (self.steamUsers.length === 0) {

		menu.append(new MenuItem({ 
			icon: nativeImage.createFromPath(path.join(appPath,"resources/img/steam.png")), 
			label: 'Import from Steam...', 
			click: function() { 
				getSteamPath()
				.then((SteamPath)=>{ return getSteamUsers(SteamPath)})
				.then((SteamUsers)=>{ self.steamUsers = SteamUsers})
				.then(()=>{
					menu.closePopup();
					contextMenu.call(self,e,oldPosition);
				})
				.catch((err)=>{
					remote.dialog.showMessageBoxSync({ type: "error", title: "Error", message: "Failed to import from Steam.", detail: `${err}` });
				});
			} 
		  })
		);
			
	} else {

		for (let i=0; i < self.steamUsers.length; i++)
		{
			menu.append(new MenuItem({ 
				icon: nativeImage.createFromPath(path.join(appPath,"resources/img/steam.png")),
				label: `Import ${self.steamUsers[i].name}'s Steam avatar`,
				click: function() { 
					request(self.steamUsers[i].profile.avatarFull,{encoding: "base64"}).then((res)=>{
						const base64 = `data:${res.headers["content-type"]};charset=utf-8;base64,${res.body}`
						localStorage.setItem("avatar",base64);
						self.update();
					}).catch((err)=>{
						remote.dialog.showMessageBoxSync({ type: "error", title: "Error", message: `Failed to fetch ${self.steamUsers[i].name}'s avatar.`, detail: `${err}` });
					});			
				} 
			  })
			);
		}
		
	}
		
	if(position && position.x && position.y) {
		menu.popup({x: position.x, y: position.y });
	} else {
		menu.popup();
	}
}

module.exports = { contextMenu }