//wip

class Timer {
    constructor() {
      this.start = new Date();
      this.played = 0;
    }

    stop() {
      this.played = Math.floor( (new Date().getTime() - this.start.getTime()) / 1000 );
    }
  
}

WQL.createEventSink();
app.processMonitor = WQL.subscribe({ filterWindowsNoise: false });

processMonitor.on("creation", async (process,pid) => {
    
   // debug.log(`creation: ${process}::${pid}`);
    
    const game = gameindex.find(game => game.binary === process);
    if(game) 
    {
      debug.log(`DB Hit for ${game.name}(${game.appid})`);
      if (app.nowPlaying.includes(game)) {
        debug.log("Already playing ! (Only one instance supported");
      } else {
      
        const playing = Object.assign(game,{ 
          pid: pid,
          timer: new Timer
        });
        debug.log(playing);
        
        const infod = await tasklist.getProcessInfo(pid,{verbose: true});
        console.log(infod)
        
        app.nowPlaying.push(playing);
      }

      toast({
        appID: "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
        uniqueID: `${game.appid}`,
        title: game.name,
        message: `Now playing`,
        icon: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.icon}.jpg`,
        silent: true
      }).catch(()=>{});
    }
    
});

processMonitor.on("deletion",(process,pid) => {
    
    //debug.log(`deletion: ${process}::${pid}`);
    
    const game = app.nowPlaying.find(game => game.pid === pid && game.binary === process);
    if (game)
    {
      debug.log(`Stop playing ${game.name}(${game.appid})`);
      game.timer.stop();
      const playedtime = game.timer.played;
      
      let index = app.nowPlaying.indexOf(game);
      if (index !== -1) { app.nowPlaying.splice(index, 1); } //remove from nowPlaying
   
      debug.log("playtime: " + Math.floor( playedtime / 60 ) + "min");
      
      track.savetime(game.appid,playedtime); 
      
      toast({
        appID: "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp",
        uniqueID: `${game.appid}`,
        title: game.name,
        message: `You played ${Math.floor( playedtime / 60 )} min`,
        icon: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.icon}.jpg`,
        silent: true
      }).catch(()=>{});
      
    }

});