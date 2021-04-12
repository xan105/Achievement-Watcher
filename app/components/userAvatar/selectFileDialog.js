'use strict';

const remote = require('@electron/remote');
const { imageFileToBase64 } = require('./avatar.js');

async function selectFileDialog() {

	const self = this;
	self.style["pointer-events"] = "none";
	
	try{
		const dialog = await remote.dialog.showOpenDialog({
			properties: ['openFile', 'showHiddenFiles', 'dontAddToRecent'], filters: [
				{ name: 'Image', extensions: ['jpeg', 'jpg', 'png', 'gif', 'bmp'] },
			]
		}); 
			
		if (dialog.filePaths && dialog.filePaths.length > 0) { //if cancel will be 0
			const avatar = await imageFileToBase64(dialog.filePaths[0]);
			localStorage.setItem("avatar", avatar);
			self.update();
		}
	}catch(err){
		remote.dialog.showMessageBoxSync({ type: "error", title: "Unexpected Error", message: "Failed to set avatar.", detail: `${err}` });
	}
	
	self.style["pointer-events"] = "initial";
};

module.exports = { selectFileDialog };