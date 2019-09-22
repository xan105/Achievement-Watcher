A sexy achievement file parser with real-time notification.<br />
View all the achievements earned on your PC whether it's coming from Steam, a Steam emulator, and more.<br />
To see the full list of what this app can import please see the [**Compatibility**](https://github.com/xan105/Achievement-Watcher#compatibility-) section.

<table >
<tr>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/home.png" width="400px"></td>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/ach_view.png" width="400px"></td>
</tr>
</table>

The original idea behind this app was that some steam emulator generate a text file where all the achievements you have unlocked are stored.
But they aren't very friendly to know which is which, here is an example :
```ini
[NEW_ACHIEVEMENT_1_1]
Achieved=1
CurProgress=0
MaxProgress=0
UnlockTime=0000000000
[SteamAchievements]
00000=NEW_ACHIEVEMENT_1_1
Count=1
```
So which achievement is NEW_ACHIEVEMENT_1_1 ? You'll have to ask the steam API or look online in a site like the steamdb to find out.
So let's just do that automagically :)

Live notification on achievement unlocking
==========================================

Not as sexy as a directX Overlay but it's the next best thing.<br />
Display a Windows toast notification and/or a growl notification (gntp@localhost:23053) when you unlock an achievement.<br />
**Please verify your notification and focus assistant settings for the toast to work properly**.<br />
You can test notification in Settings > Debug to make sure your system is correctly configured.

<p align="center">
<img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/live.gif">
</p>

Note that there might be a slight delay between the event and the display of the notification as running powershell and loading a remote img resource can take a few seconds in some cases.<br />

Game must be set to Window borderless for the notification to be rendered on top of it.<br />

If you have enabled the *souvenir* option, a screenshot will be taken<br />
and saved in your pictures folder `"Pictures\[Game Name]\[Game Name] - [Achievement Name].png"`<br />

### 🚑 Not seeing any toast notification ? Quick fix :
- try to set your game to Window borderless.
- try to disable the automatic game **and** fullscreen rule in focus assistant (Win10)<br/>
  or set them to priority and make sure that the UWP appID you are using is in your priority list (By default the Xbox appID(s) used by this app are in it).
- try to set checkIfProcessIsRunning to false in `%AppData%\Achievement Watcher\cfg\options.ini`

Oh and make sure `watchdog.exe` is running.<br />
<br />
Not all games are supported, please see below.<br />
  
Compatibility :
================

|Emulator/Client|Supported|Unlock Time|Ach Progress|Notification|
|--------|---------|-----------|------------|------------|
|Codex (Steam)| Yes | Yes | No | Yes |
|RLD! (Steam) | Yes | Yes | No | [~~Yes~~ No*](https://github.com/xan105/Achievement-Watcher/tree/master/service/src/watchdog#rld) |
|Skidrow (Steam) | Yes | No | No | No |
|ALI213 (Steam) | Via user custom dir | Yes | No | Yes |
|Hoodlum (Steam)<br>DARKSiDERS (Steam)| Yes (*UserDataFolder=mydocs*) and<br>Via user custom dir| Yes | No | [Yes*](https://github.com/xan105/Achievement-Watcher/tree/master/service/src/watchdog#hoodlum) |
|GreenLumaReborn (Steam) | Yes | No | No | No |
|SmartSteamEmu (Steam)| [Via this plugin](https://github.com/xan105/Achievement-Watcher/releases/download/1.1.1/SSE_userstatswrapper.rar) | Yes | No | Yes |
|Goldberg Steam Emu (Steam)| Via a [custom build](https://github.com/xan105/Achievement-Watcher/releases/download/1.1.1/Goldberg_Lan_Steam_Emu_v0.2.5_achievement.zip) | Yes | No | Yes |
|Legit Steam Client (Steam) | Yes but your Steam profile must be public | Yes | No | Steam overlay does it already | 
|RPCS3 (PS3) | Via user custom dir | No | N/A | RPCS3 does it already|  
|LumaPlay (Uplay) | Yes | No | No | No |


### Steam Emulator
By default the following locations will be scanned for the files steam emulators generate :
```
- %PUBLIC%\Documents\Steam\CODEX
- %appdata%\Steam\CODEX
- %ProgramData%\Steam\*\
- %localappdata%\SKIDROW
- %DOCUMENTS%\SKIDROW
- %appdata%\SmartSteamEmu
- %appdata%\Goldberg SteamEmu Saves
- %DOCUMENTS%\HLM
- %DOCUMENTS%\DARKSiDERS
```

You can add your own folder in the app, just make sure that you select a folder which contains appid folder(s) :<br/>
 ```
 |___ Custom dir
      |___ 480 
      |___ 220 
 ```
NB: To enable notification on a custom folder you need to click the bell icon next to it. 
 
For ALI213 there is no default folder so choose the dir where the `AlI213.ini` or `valve.ini` file is; <br>
The app will then parse it and look for `\Profile\[EMUUSERNAME]\Stats\achievements.bin` from the chosen location.

For Hoodlum there is no default folder so choose the dir where the `hlm.ini` file is; <br>
The app will then parse it and look for `\[UserDataFolder]\SteamEmu\stats.ini` from the chosen location.
 
⚠️ Green Luma Reborn: only if the reg key `"SkipStatsAndAchievements"` is set to `dword:00000000` for that APPID.

### Legit Steam
You can choose to view none (default) / only installed / all owned Steam games.<br/>
Ach. are updated based on files timestamp in `STEAM\appcache\stats`<br/>

⚠️ This feature requires that your Steam Profile is set to `Public`.<br/>

<p align="center">
<img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/steam_privacy.png">
</p>

Due to the server rate limit if you 've a huge Steam library it might not get all your games in one go.<br/>
If you are using your own steam web api key (see **Steam Web API Key** section below), this doesn't concern you.

### RPCS3 Playstation 3 Emulator
Please add a folder in the app where `rpcs3.exe` is located. The app will then look for ~~achievement~~ trophies for every game and every ps3 user.<br/>
Note that `TROPCONF.SFM` is language specific; So for PS3 games, trophies will be in the language you are playing with.<br/>
As of this writing there is no unlock time : the trophies unlocked in a PS3 that has never been connected online doesn't contains timestamps.

### LumaPlay
Since there is no public API to get a Uplay game achievements info as of this writing there are limitations: <br/>
Uplay client must be installed in order to try to get the game's info from its cache.<br/> 
To have the game info in the Uplay client cache you **don't** need to install the game but you need to have at least seen the achievement listing page of the game once in the Uplay client.<br/>
This app will keep and send the data to a remote server to build its own cache, when the server has the game info Uplay client is no longer required as the app will fetch the data from said server. <br/>
Therefore with time only newest game would require Uplay client in theory. <br/>

Options
=======
Options are stored in ```%AppData%\Achievement Watcher\cfg\options.ini``` but most of them are configurable via the GUI<br />

### [achievement]
- lang<br />
  default to user locale<br />
  Both UI and data from Steam.<br />
  
- showHidden<br />
  default to false<br />
  Wether or not show hidden achievements if any.<br />
  
- mergeDuplicate<br />
  default to true<br />
  Try to merge multiple achievement source for the same game.<br />
  
- timeMergeRecentFirst<br/>
  default to true<br />
  When merging duplicates, show the most recent timestamp (set to false for the oldest).
  
- hideZero<br />
  default to false<br />
  Hide 0% Game.<br />
  
- legitSteam<br />
  default to 0<br />
  Steam games : (0) none / (1) installed / (2) owned.<br />
  
### [notification]

- notify<br />
  default to true<br />
  Notify on achievement unlocking if possible. <br />
  (`AchievementWatcher.exe` doesn't need to be running for this, but `watchdog.exe` does).<br />
  
- powershell <br />
  default to true<br />
  Use powershell to create a Windows 8-10 toast notification.<br />
  
- gntp <br />
  default to true<br />
  Send a gntp@localhost:23053 if available.<br />
  
- souvenir<br />
  default to true<br />
  Take a screenshot when you unlock an achievement in<br />
  `"Pictures\[Game Name]\[Game Name] - [Achievement Name].png"`<br />
  
- toastSouvenir<br />
  default to 0<br />
  Display souvenir screenshot inside the toast (Win10 only).<br />
  (0) disable / (1) header (image crop) / (2) footer (image resized to fit) <br />
  <br />
  Example:
  
  <table >
  <tr>
  <td align="center">header</td>
  <td align="center">footer</td>
  </tr> 
  <tr>
  <td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/toastedSouvenir_header.gif" width="400px"></td>
  <td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/toastedSouvenir_footer.gif" width="400px"></td>
  </tr>
  </table>
  
  Both will show the screenshot within their toast in the action center if there is enough space.<br />
  Otherwise there will be an arrow to show/hide (collapse).<br />
  
- showDesc<br />
  default to false<br />
  Show achievement description if any.<br />
  
- customToastAudio<br />
  default to 1<br />
  Specifies the sound to play when a toast notification is displayed.<br />
  (0) disable-muted / (1) System default / (2) Custom sound specified by user<br />
  
- rumble<br />
  default to true<br />
  Vibrates first xinput controller when unlocking an achievement.<br />
  
### [notification_advanced]

👮 Change these values only if you know what you are doing.<br />

- timeTreshold<br />
  default to 5 (sec)<br />
  When an achievement file is modified; Amount of sec `watchdog.exe` will consider the most recent achieved achievement (from its timestamp value) to be new.<br />
  
- checkIfProcessIsRunning<br />
  default to true<br />
  When an achievement file is modified; Wether to check or not if the corresponding game is running and responding.<br />
  <br />
  Both options are mainly there to mitigate false positive.<br />
  
- tick<br />
  default to 600 (ms)<br />
  Ignore file modification within specified timeframe to prevent spam of notification when a game triggers multiple file write at the same time.<br />
  Set it to 0 to disable this feature.<br />
  
- keepTrack<br>
  default to true<br>
  Keep track of unlocked achievements to prevent notification of already unlocked achievement when the steam emu overwrites     previous timestamp.
  
- appID<br />
  if not set, default to Xbox Game Bar if available otherwise to Xbox App<br />
  Notification appID ([Application User Model ID](https://docs.microsoft.com/fr-fr/windows/desktop/shell/appids)).<br />
  Example: 
  
  |Name| AppID |
  |----|-------|
  |Xbox Game Bar|Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App |
  |Xbox App| Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp |
  |Xbox App (Win 8)| microsoft.XboxLIVEGames_8wekyb3d8bbwe!Microsoft.XboxLIVEGames |
  
  ⚠️ You need to use a UWP AppID otherwise you won't be able to remotely load ach. img.
  
Steam Web API Key
=================
Some use of the Steam Web API to fetch data from Steam requires the use of an API Key.<br />
If you leave the field blank in the settings section, it will automagically fetch said data.<br />

<p align="center">
<img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/settings.png" width="600px">
</p>

An example of a server that feeds you the data is provided within this repo.<br />
This service is not guarantee over time and is solely provided for your own convenience.<br />
If you experience any issues please use your own Steam Web API key.<br />              
                
You can acquire one [by filling out this form](https://steamcommunity.com/dev/apikey).<br />
Use of the APIs also requires that you agree to the [Steam API Terms of Use](https://steamcommunity.com/dev/apiterms).<br />

Command Line Args | URI Scheme
==============================

Args:<br />
`--appid xxx [--name yyy]`<br />

URI:<br />
`ach:--appid xxx [--name yyy]`<br />

xxx is a steam appid<br />
yyy is an optional steam ach id name<br />

After the loading directly display the specified game.<br />
And if specified highlight an achievement.

NB: This is what the toast notification uses in order to be clickable and open the game page highlighting the unlocked achievement.

Translation Help
================

I do my best to translate everything for every supported language by Steam, but it's rather difficult and I don't speak that much languages.
Fluent in another language ? Any help to add/modify/improve would be greatly appreciated.

More details [here](https://github.com/xan105/achievement-watcher/tree/master/app/locale)

Auto-Update
===========

This software auto update itself via Windows scheduled tasks.
There are .cmd files in the root directory to create, delete and manually run the tasks.

File cache & Logs
=================
in ```%AppData%\Achievement Watcher```

Legal
=====
Software provided here is to be use at your own risk. This is provided as is without any express or implied warranty.<br />
In no event or circumstances will the authors or company be held liable for any damage to yourself or your computer that may arise from the installation or use of the free software aswell as his documentation that is provided on this website.<br />
And for anything that may occur as a result of your use, or inability to use the materials provided via this website.<br />

Software provided here is purely for informational purposes and does not provide nor encourage illegal access to copyrighted material.<br />

Software provided here is not affiliated nor associated with Steam, © Valve Corporation and data from its API is provided as is without any express or implied warranty.<br />

Software provided here is not affiliated nor associated with Uplay, © Ubisoft and data from its API is provided as is without any express or implied warranty.<br />

Software provided here is not affiliated nor associated with any cracking scene groups.<br />

Other trademarks, copyright are the property of their respective owners. No copyright or trademark infringement is intended by using third-party resources. Except where otherwise specified, the contents of this project is subject to copyright.<br />
