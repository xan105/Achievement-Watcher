'use strict';

const path = require('path');
const fs = require('@xan105/fs');
const request = require('request-zero');
const WQL = require('wql-process-monitor');
const humanizeDuration = require("humanize-duration");
const EventEmitter = require("emittery");
const Timer = require('./timer.js');
const TimeTrack = require('./track.js');

const debug = new (require("@xan105/log"))({
  console: true,
  file: path.join(process.env['APPDATA'],"Achievement Watcher/logs/playtime.log")
});

const filter = [
	"nw.exe",
	"svchost.exe",
	"conhost.exe",
	"dllhost.exe",
	"backgroundTaskHost.exe",
	"SearchProtocolHost.exe",
	"SearchFilterHost.exe",
	"RuntimeBroker.exe",
	"powershell.exe",
	"cmd.exe",
	"smartscreen.exe",
	"explorer.exe",
	"FileCoAuth.exe",
	"audiodg.exe",
	"OAWrapper.exe", //NVIDIA GeForce Experience
	"firefox.exe",
	"chrome.exe",
	"GameLauncher.exe",
	"game.exe",
	"launcher.exe"
];

async function init(){

	const emitter = new EventEmitter();

	let nowPlaying = [];
	let gameIndex = await getGameIndex();

	await WQL.promises.createEventSink();
	const processMonitor = await WQL.promises.subscribe({ filterWindowsNoise: false, filter: filter });

	processMonitor.on("creation", ([process,pid,filepath]) => {
	  
	  const game = gameIndex.find(game => game.binary === process && !game.name.includes("Demo"));
	  if(game) 
	  {
		debug.log(`DB Hit for ${game.name}(${game.appid}) in "${filepath}"`);
		if (!nowPlaying.includes(game)) { //Only one instance allowed

		  const playing = Object.assign(game,{ 
			pid: pid,
			timer: new Timer
		  });
		  debug.log(playing);
		  
		  nowPlaying.push(playing);
		} else {
			debug.error("Only one game instance allowed");
		}
	
		emitter.emit("notify", [game]);

	  }
  
	});

	processMonitor.on("deletion",([process,pid]) => {
	  
	  const game = nowPlaying.find(game => game.pid === pid && game.binary === process);
	  if (game)
	  {
		debug.log(`Stop playing ${game.name}(${game.appid})`);
		game.timer.stop();
		const playedtime = game.timer.played;
		
		let index = nowPlaying.indexOf(game);
		if (index !== -1) { nowPlaying.splice(index, 1); } //remove from nowPlaying
	 
		debug.log("playtime: " + Math.floor( playedtime / 60 ) + "min");
		
		const playedtimeHumanized = `You played for ${humanizeDuration(playedtime * 1000, { language: "en", conjunction: " and ", units: ["h", "m", "s"] })}`;
		
		TimeTrack(game.appid,playedtime).catch((err)=>{debug.error(err)});
		
		emitter.emit("notify", [game, playedtimeHumanized]);

	  }

	});

	return emitter;
};

async function getGameIndex(){
	
	const filePath = path.join(process.env['APPDATA'],"Achievement Watcher/steam_cache/schema","gameIndex.json");
	
	let gameIndex;
	
	try{
		if (await fs.existsAndIsYoungerThan(filePath,{timeUnit: 'd', time: 1})) {
			gameIndex = JSON.parse( await fs.readFile(filePath,"utf8") );
		} else {
			try{
				gameIndex = ( await request.getJson("https://api.xan105.com/v2/steam/gameindex") ).data;
				await fs.writeFile(filePath,JSON.stringify(gameIndex),"utf8").catch((err)=>{debug.error(err)});
			}catch(err){
				debug.error(err);
				gameIndex = JSON.parse( await fs.readFile(filePath,"utf8") );
			}
		}
	}catch(err){
		debug.error(err);
		gameIndex = [];
	}

	return gameIndex;
}

module.exports = { init };