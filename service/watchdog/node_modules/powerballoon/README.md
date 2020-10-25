About
=====

Windows balloon notification using PowerShell.<br />
Doesn't use any native module. Everything is done through PowerShell.<br />

Looking for Windows toast notification ? [node-powertoast](https://github.com/xan105/node-powertoast)

Example
=======
<table>
<tr>
<td align="left"><img src="https://github.com/xan105/node-powerballoon/raw/master/screenshot/win7.png"></td>
<td align="left"><img src="https://github.com/xan105/node-powerballoon/raw/master/screenshot/win10.png"></td>
</tr>
<tr>
<td align="center">Windows 7</td>
<td align="center">Windows 10</td>
</tr>
</table>

```js 
//Sending a simple balloon notification
const balloon = require('powerballoon');

balloon({
  title: "NPM",
  message: "Installed.",
  ico: "C:\\Program Files\\nodejs\\node.exe"
}).catch((err) => { 
  console.error(err);
});
```

Installation
============

`npm install powerballoon`


Options
=======

- **title**
  
  The title of your notification

- **message**

  The content message of your notification.
  This can not be empty !<br />
  Thus _default to "Hello World !"_

- **ico**

  Path to the icon shown in the systray.<br />
  Path can target either an .ico file or an .exe.<br />
  _default to the PowerShell executable icon._

- **type**

  + 0 : Info
  + 1 : Warning
  + 2 : Error
  
  _default to 'Info'_

- **showTime** 

  balloon duration in ms.<br />
  _default to 7000._
  
  ⚠️ Please note that Windows can dismiss the pop-up before the timeout expires.

Common Issues
=============

- Windows balloon are disabled

  There is a registry setting that controls whether a balloons can be show or not.<br />
  `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced`<br />
  DWORD::EnableBalloonTips
  
- Powershell is not recognized as an internal or external command [...]

  Powershell needs to be installed.<br />
  Windows 7/Server 2008 R2 are the first Windows versions to come with PowerShell installed.
