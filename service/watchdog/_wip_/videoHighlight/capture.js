//Work in progress

"use strict"

const path = require('path');
const { spawn } = require('child_process');
const resolution = require("win-screen-resolution");

module.exports = function h264_nvenc (filePath, option = {}) { //NVIDIA nvenc ('h264_nvenc')
	return new Promise((resolve,reject) => {
		
		const currentRes = resolution.current();
		
		const options = {
			timeLength: option.timeLength || "00:00:10",
			framerate: option.framerate || 60,
			probesize: option.probesize || 42, //1080p
			threadQueue: option.threadQueue || 64,
			size: option.size || `${currentRes.width}x${currentRes.height}`,
			videoEncodingOptions: option.videoEncodingOptions || "-b:v 5000k -minrate:v 2500k -maxrate:v 8000k -bufsize:v 8000k -qp:v 19 -profile:v high -rc:v vbr -level:v 4.2 -r:v 60 -g:v 120 -bf:v 3", //Tested with GTX 1060
			yuv420: (option.yuv420 != null) ? option.yuv420 : true, //True: Encoding for 'dumb players' which only support the YUV planar color space with 4:2:0 chroma subsampling
			mouse: option.mouse || false,
			audioInterface: option.audioInterface || null,
			audioEncodingOptions: option.audioEncodingOptions || "-b:a 160k"
		};

		let cmdline = makeCommandLine(options);
		
		console.log(cmdline);
		
		const ext = path.parse(filePath).ext;
		if(!ext) throw "EINVALIDFILEPATH";
		const resultPath = path.resolve( ( ext === ".mp4" ) ? filePath : filePath.replace(ext,".mp4") );
		cmdline.push(resultPath);
		
		const ffmpeg = spawn(path.join(__dirname, "bin/ffmpeg.exe"), cmdline, {stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, windowsVerbatimArguments: true});
		
		let errorMessage = [];
		ffmpeg.stderr.on('data', (data) => { errorMessage.push(data) });
		
		ffmpeg.on('exit', (code) => {
         if (code == 0)
         { 
            resolve( resultPath );      
         }
         else
         {
            reject( errorMessage.join('') );
         }
		});
	
	});
}

function makeCommandLine(options){

	const videoCodec = ['-c:v','h264_nvenc'];
	const audioCodec = ['-c:a', 'aac'];
		
	const videoInterface = [
		'-f','gdigrab','-t',options.timeLength,'-framerate',options.framerate,'-probesize',`${options.probesize}M`,'-draw_mouse',(options.mouse) ? '1':'0',
		'-offset_x','0','-offset_y','0','-video_size',options.size,'-show_region','0', //offset_x/y: Active display is always at 0,0
		'-thread_queue_size',options.threadQueue,'-i','desktop'
	];
		
	const audioInterface = [
		'-f', 'dshow', '-thread_queue_size', options.threadQueue, '-i', `audio="${options.audioInterface}"`
	];
		
	let cmdline = ['-hide_banner']; //Suppress ffmpeg printing copyright notice, build options and library versions
		
	//Input Interface
	cmdline = cmdline.concat(videoInterface);
	if (options.audioInterface) cmdline = cmdline.concat(audioInterface);
		
	//Codec
	cmdline = cmdline.concat(videoCodec);
	if (options.audioInterface) cmdline = cmdline.concat(audioCodec);
		
	//Output encoding	
	cmdline = cmdline.concat(options.videoEncodingOptions.split(' '));
	if (options.audioInterface) cmdline = cmdline.concat(options.audioEncodingOptions.split(' '));
		
	//Misc
	if (options.yuv420) cmdline = cmdline.concat('-pix_fmt yuv420p'.split(' '));
	if (options.audioInterface) cmdline.push('-shortest'); //stop audio with video length
	cmdline.push('-y'); //Overwrite target file if any
	
	return cmdline;
}