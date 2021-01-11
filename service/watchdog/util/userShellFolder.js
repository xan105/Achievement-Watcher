'use strict';

const path = require('path');
const regedit = require('regodit');

const folders = {
	mypictures : regedit.RegQueryStringValueAndExpand("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","My Pictures") || path.join(process.env['USERPROFILE'],"Pictures"),
	myvideo : regedit.RegQueryStringValueAndExpand("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","My Video") || path.join(process.env['USERPROFILE'],"Videos")
};

module.exports = folders;