A sexy achievement file parser with real-time notification.

<table >
<tr>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/home.png" width="400px"></td>
<td align="left"><img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/ach_view.png" width="400px"></td>
</tr>
</table>

Some steam emulator generate a text file where all the achievements you have unlocked are stored.
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
Display a Windows toast notification when you unlock an achievement.<br />
**Please verify your notification and focus assistant settings for this to work properly**.<br />

<p align="center">
<img src="https://github.com/xan105/Achievement-Watcher/raw/master/screenshot/live.gif">
</p>

You can disable this feature in the settings section.<br />

Note that there might be a slight delay between the event and the display of the notification as running powershell and loading a remote img resource can take a few seconds in some cases.<br />

Game must be set to Window borderless for the notification to be rendered on top of it otherwise you'll just here the sound.<br />

🚑 Not seeing any notification ? Quick fix :
- try to set your game to Window borderless.
- try to disable the automatic game rule in focus assistant
- try to set checkIfProcessIsRunning to false in `%appdata%/Achievement Watcher/options.ini`

Oh and make sure `watchdog.exe` is running.<br />
<br />
Not all games are supported, please see below.<br />
  
Compatibility :
================

**From file:**<br/>

|Steam Emulator|Unlock Time|Ach Progress|Notification|File|
|--------------|-----------|------------|------------|----|
|Codex| Yes | No (always set to zero by emu) | Yes | achievements.ini |
|RLD!| No (Unknow hex time) | No (always set to zero by emu) | No | stats\achievements.ini |
|Skidrow| No | No | No | achieve.dat |
|ALI213| Yes | No | No | achievements.bin |

By default the following location will be scanned for the above steam emu file :
```
- %PUBLIC%\Documents\Steam\CODEX
- %appdata%\Steam\CODEX
- %ProgramData%\Steam\*\
- %localappdata%\SKIDROW
- %appdata%\SmartSteamEmu
```

Will be scanned too altho there is no achievement file yet at the time of writing :
```
- Documents\CPY_SAVES\*\
- %appdata%\CPY_SAVES\*\
- %appdata%\Goldberg SteamEmu Saves
```

You can add your own folder in the app, just make sure that you select a folder which contains appid folder(s) :<br/>
 ```
 |___ Custom dir
      |___ 480 
      |___ 220 
 ```
For ALI213 there is no default folder so choose the dir where the `AlI213.ini` file is; <br>
The app will then parse it and look for `\Profile\[EMUUSERNAME]\Stats\achievements.bin` from the chosen location.

⚠️ Please note that notification only works with CODEX emu file,<br/>
by default in `%PUBLIC%\Documents\Steam\CODEX` but you can add other location in the app.

**From Registry:**<br/>

|Steam Emulator|Unlock Time|Ach Progress|Notification|Location|
|--------------|-----------|------------|------------|----|
|Green Luma Reborn| No | No | No | HKCU\SOFTWARE\GLR\AppID\[APPID] |

⚠️ Parse GLR ach for APPID only if the reg key "SkipStatsAndAchievements" is set to dword:00000000.

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

Options
=======
Options are stored in ```%AppData%\Roaming\Achievement Watcher\cfg\options.ini```<br />

[achievement]
- lang<br />
  default to user locale<br />
  Both UI and data from Steam<br />
- showHidden<br />
  default to false<br />
  Wether or not show hidden achievements if any<br />
- mergeDuplicate<br />
  default to true<br />
  Try to merge multiple achievement files with the same steam appid<br />
- hideZero<br />
  default to false<br />
  Hide 0% Game<br />
- notification<br />
  default to true<br />
  Display or not a Windows toast notification on achievement unlocking. <br />
  (`AchievementWatcher.exe` doesn't need to be running for this, but `watchdog.exe` does).<br />
  
[notifier]
- timeTreshold<br />
  default to 30 sec<br />
  When an achievement file is modified; Amount of sec `watchdog.exe` will consider the most recent achieved achievement (from its timestamp value) to be new.<br />

- checkIfProcessIsRunning<br />
  default to true<br />
  When an achievement file is modified; Wether to check or not if the corresponding game is running and responding.<br />
  <br />
  Both options are mainly there to mitigate false positive.

Command Line Args | URI Scheme
==============================

Args:<br />
`--appid xxxxx `<br />

URI:<br />
`ach:xxxx`<br />

xxx is a steam appid<br />

After the loading directly display the specified game.<br />
                    
Windows compatibility
=====================
Windows x64 only.<br />
Windows 10 >= 1809 is recommended.<br />

It should work starting with Windows 8 and above but keep in mind that this was mostly tested with Windows 10.<br />

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
in ```%AppData%\Roaming\Achievement Watcher```

Legal
=====
Software provided here is to be use at your own risk. This is provided as is without any express or implied warranty.<br />
In no event or circumstances will the authors or company be held liable for any damage to yourself or your computer that may arise from the installation or use of the free software aswell as his documentation that is provided on this website.<br />
And for anything that may occur as a result of your use, or inability to use the materials provided via this website.<br />

Software provided here is purely for informational purposes and does not provide nor encourage illegal access to copyrighted material.<br />

Software provided here is not affiliated nor associated with Steam, © Valve Corporation and data from its API is provided as is without any express or implied warranty.<br />

Software provided here is not affiliated nor associated with any cracking scene groups.<br />

Other trademarks, copyright are the property of their respective owners. No copyright or trademark infringement is intended by using third-party resources. Except where otherwise specified, the contents of this project is subject to copyright.<br />
