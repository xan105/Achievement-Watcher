A sexy achievement file parser with real-time notification and playtime tracking.<br />
View every achievement earned on your PC whether it's coming from Steam, a Steam emulator, and more.<br />
To see the full list of what this app can import please see the [**Compatibility**](https://github.com/xan105/Achievement-Watcher#compatibility-) section.

<table >
<tr>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/home.png" width="400px"></td>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/ach_view.png" width="400px"></td>
</tr>
</table>

The original idea behind this app was that some steam emulators generate a text file where your unlocked achievements are stored. 
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

Notification on achievement unlocking
==========================================

Not as sexy as a directX Overlay but it's the next best thing.<br />
Display a Windows toast notification when you unlock an achievement.<br />
⚠️ **Please verify your Windows notification and focus assistant settings for the toast to work properly**.<br />
You can test notification in Settings > Debug to make sure your system is correctly configured.

<p align="center">
  <img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/live.gif">
</p>

There might be a slight delay between the event and the display of the notification when running powershell and loading a remote image can take a few seconds in some cases.<br />

Game must be set to Window borderless for the notification to be rendered on top of it.<br />

If you have enabled the *souvenir* option a screenshot will be taken<br />
and saved in your pictures folder `"Pictures\[Game Name]\[Game Name] - [Achievement Name].png"`<br />

### 🚑 Not seeing any toast notification ? Quick fix :
- Try to set your game to Window borderless.
- Try to disable the automatic game **and** fullscreen rule in focus assistant (Win10)<br/>
  or set them to priority and make sure that the UWP appID you are using is in your priority list (By default the Xbox appID(s) used by this app are in it).
- Try to set checkIfProcessIsRunning to false in `%AppData%\Achievement Watcher\cfg\options.ini`

Windows 8.1 : Don't forget quiet hours.<br />
Windows 10 >= 1903 : New focus assist auto rule for fullscreen app set to alarm only by default prevents the notification from working out of the box.

The process `watchdog.exe` is the one doing all the work so make sure it is running.

Not all games are supported, please see the compatibility section below.

<hr>

You can also display a notification with:
  - [Websocket](https://github.com/xan105/Achievement-Watcher#Websocket)
  - [Growl Notification Transport Protocol](https://github.com/xan105/Achievement-Watcher#GNTP)
  
Steam Web API Key
=================
Some use of the Steam Web API to fetch data from Steam requires the use of an API Key.<br />
If you leave the field blank in the settings section, it will automagically fetch said data.<br />

<p align="center">
<img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/settings.png" width="600px">
</p>

An example of a server that feeds you the data is provided within this repo.<br />
This service is **not** guarantee over time and is solely provided for your own convenience.<br />
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

How to build
============

### Prequisites:

You will need Node.js 12.x in x64 with NPM installed.<br/>
Innosetup 5 unicode with preprocessor and [Inno Download Plugin](https://mitrichsoftware.wordpress.com/inno-setup-tools/inno-download-plugin/) (building the setup)<br/>

For Node.js you globally need asar and json :<br/>
```
npm install -g asar json
```

There will be some native_module to compile so you'll need :<br/>
VS2017, Python 2.7(node-gyp), and the Windows SDK **10.0.17134.0** (1803 Redstone 4)

### Build:

Install `node_modules` folders with `npm install.cmd`<br/>
Use `buildme.cmd` in the root folder to build.

### Notes: 

+ Most of the native code is now shipped as prebuilt binaries. If you want to compile them yourself I invit you to check out their corresponding repo.<br/>
NB: Golang cgo requires a gcc compiler installed and set in PATH (recommended : http://tdm-gcc.tdragon.net/download).

+ Innosetup is expected to be installed in `C:\Program Files (x86)\Inno Setup 5` if that is not the case then update `buildme.cmd` with the correct path.

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
