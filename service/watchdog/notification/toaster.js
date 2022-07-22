'use strict';

const path = require("path");
const fs = require("@xan105/fs");
const userShellFolder = require("../util/userShellFolder.js");
const videoCapture = require("@xan105/video-capture");
const screenshot = require("@xan105/screenshot");
const toast = require("./transport/toast.js");
const balloon = require("powerballoon");
const gntp = require("./transport/gntp.js");
const xinput = require("xinput-ffi");
const fetch = require("./prefetch.js");
const { broadcast } = require("../websocket.js");
const regedit = require("regodit");

const debug = require("../util/log.js");

let videoIsRecording = false;

module.exports = async (message, option = {}) => {	
		
	try{	
		const options = {
			notify: option.notify != null ? option.notify : true,
			transport: {
				toast: option.transport.toast != null ? option.transport.toast : true,
				gntp: option.transport.gntp || false,
				websocket: option.transport.websocket || false
			},
			toast: {
				appid: option.toast.appid,
				winrt: option.toast.winrt != null ? option.toast.winrt : true,
				balloonFallback: option.toast.balloonFallback || false,
				customAudio: option.toast.customAudio >= 0 && option.toast.customAudio <= 2 ? option.toast.customAudio : 1,
				imageIntegration: option.toast.imageIntegration >= 0 && option.toast.imageIntegration <= 2 ? option.toast.imageIntegration : 0,
				group: option.toast.group || false,
				cropIcon: option.toast.cropIcon || false,
				attribution: option.toast.attribution  || null
			},
			gntpLabel: option.gntpLabel,
			prefetch : option.prefetch != null ? option.prefetch : true,
			souvenir: {
				screenshot: option.souvenir.screenshot || false,
				video: option.souvenir.video >= 0 && option.souvenir.video <= 2 ? option.souvenir.video : 0,
				screenshot_options: option.souvenir.screenshot_options || {},
				video_options: option.souvenir.video_options || {}
			},
			rumble: option.rumble != null ? option.rumble : true
		};
		
		if (options.souvenir.video > 0 && videoIsRecording === false) {
			debug.log("Souvenir: video");
			try {
				const filePath = path.join(options.souvenir.video_options.custom_dir || userShellFolder["myvideo"],fs.win32.sanitizeFileName(message.gameDisplayName),fs.win32.sanitizeFileName(message.achievementDisplayName) + ".mp4");
				debug.log(`"${filePath}"`);
				videoIsRecording = true;
				const vendor = options.souvenir.video == 1 ? "nvenc" : "amf";
				const encoder = options.souvenir.video_options.codec == 1 ? "hevc" : "h264";
				videoCapture.hwencode(filePath, `${encoder}_${vendor}`, {
          overwrite: options.souvenir.video_options.overwrite_video,
          timeLength: `00:00:${options.souvenir.video_options.duration}`,
          framerate: options.souvenir.video_options.framerate,
          bits10: options.souvenir.video_options.colorDepth10bits,
          mouse: options.souvenir.video_options.cursor,
          audioInterface: "virtual-audio-capturer"
				})
				.then(()=>{ videoIsRecording = false })
				.catch((err) => { 
					videoIsRecording = false;
					debug.error(err); 
				});
			}catch(err){ debug.error(err) }
		} else {
      debug.log("Skipping souvenir: video");
		}
		
		if (options.souvenir.screenshot) {
			debug.log("Souvenir: screenshot");
			try{
				const filePath = path.join(options.souvenir.screenshot_options.custom_dir || userShellFolder["mypictures"],fs.win32.sanitizeFileName(message.gameDisplayName),fs.win32.sanitizeFileName(message.achievementDisplayName) + ".png");
				debug.log(`"${filePath}"`);
				if (options.toast.imageIntegration > 0) {
					message.image = await screenshot(filePath, options.souvenir.screenshot_options.overwrite_image);
				} else {
					screenshot(filePath, options.souvenir.screenshot_options.overwrite_image )
					.catch( (err) => { debug.error(err) });
				}
			}catch(err){ debug.error(err) }
		} else {
      debug.log("Skipping souvenir: screenshot");
		}
		
		if (options.notify)
		{
			if  (options.transport.websocket) {
				debug.log("Websocket broadcast");
				
				let notification = {
					appID: message.appid,
					game: message.gameDisplayName,
					achievement: message.achievementName,
					displayName: message.achievementDisplayName,
					description: message.achievementDescription,
					icon: message.icon,
					time: message.time
				};
				
				if (message.progress) notification.progress = message.progress;
				
				broadcast(notification)
			}
			
			if (options.prefetch) {
				debug.log(`Prefetching...`);
				if (message.icon && (message.icon.startsWith("http:") || message.icon.startsWith("https:"))) {
					message.icon = await fetch(message.icon,message.appid);
				}
				
				if (options.transport.toast && options.toast.imageIntegration > 0 && message.image && (message.image.startsWith("http:") || message.image.startsWith("https:"))) {
					message.image = await fetch(message.image,message.appid);    
				}
			}
			
			if (options.transport.toast){ 
				debug.log("Toast notification");
				try{
					await toast(message,options) 
				}catch(err){
					debug.error(err);
					if (options.toast.balloonFallback) {
						debug.warn("Fallback to balloon-tooltip");
						try{
							
							let notification = {
								title: message.achievementDisplayName,
								message: message.achievementDescription || "Achievement unlocked !", //description can not be empty for a balloon
								ico: path.resolve("./notification/icon/icon.ico")
							};
							
							if (message.progress) notification.message = `[ ${message.progress.current}/${message.progress.max} ]\n${message.achievementDescription}`;
							
							await balloon(notification);
						}catch(err){ debug.error(err) }
					}
				}
			}
			else { 
				debug.log("Toast notification is disabled > SKIPPING") 
			}
			
			if (options.transport.gntp){
				debug.log("GNTP");
        try {
					if (await gntp.hasGrowl()) {
						debug.log("Sending GNTP Grrr!");
						
						let notification = {
							title: message.achievementDisplayName, 
							message: message.achievementDescription, 
							icon: message.icon
						};
						
						if (options.gntpLabel) notification.label = options.gntpLabel;
						
						if (message.progress) notification.message = `[ ${message.progress.current}/${message.progress.max} ]\n${message.achievementDescription}`;
						
						await gntp.send(notification)
					} else {
						debug.error("GNTP endpoint unreachable");
					}
				}catch(err){ debug.error(err) };
				
			} else {
				debug.log("GNTP notification is disabled > SKIPPING");
			}
			
			if(options.rumble){
				if (!options.transport.toast) message.delay = 0;
				const duration = +await regedit.promises.RegQueryIntegerValue("HKCU","Control Panel/Accessibility","MessageDuration").catch(()=>{ return null }) || 5; 
				setTimeout(function(){ 
					debug.log("XInput Rumble");
					xinput.rumble({forceStateWhileRumble: true}).catch( (err) => { debug.warn(err) });
				}, (duration * 1000) * message.delay || 0);
			}
			
		}
	}catch(err){debug.log(err)}
}