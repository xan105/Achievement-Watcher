'use strict';

const path = require('path');
const urlParser = require('url');
const fs = require('@xan105/fs');
const request = require('request-zero');

const debug = require("../util/log.js");

module.exports = async (url, appID) => {
	try{
		const cache = path.join(process.env['APPDATA'],`Achievement Watcher/steam_cache/assets/${appID}`);
		
		const filename = path.parse(urlParser.parse(url).pathname).base;
		const filePath = path.join(cache,filename);

		if (await fs.exists(filePath)) {
		  debug.log("fetching from local cache");
		  return filePath;
		} else {
		  debug.log(`fetching [${url}] ...`);
		  const { path : res } = await request.download(url,cache);
		  return res;
		}
	}catch(err){
		return url;
	}
}