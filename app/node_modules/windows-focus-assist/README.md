
## windows-focus-assist
**windows-focus-assist** checks if Windows 10 Focus Assist - natively, without shelling out, and without any dependencies. 

With Windows 10 1803 (Creators Update), Microsoft introduced Focus Assist replacing Quiet Hours. Unfortunately there is no simple registry key anymore for Win32 Apps to check when to be quit. This native node module uses an unsupported/undocumented API to get the status of the Focus Assist. The original code was provided by [Rafael Rivera](https://github.com/riverar)

⚠ The API used by windows-focus-assist can change/break at any time in the future. ⚠

```
npm install windows-focus-assist
```

```
const { getFocusAssist } = require('windows-focus-assist');

const focusAssist = getFocusAssist();
console.log('FocusAssist:', focusAssist.name);
```

#### License
MIT, please see LICENSE for details. Copyright (c) 2018 Jan Hannemann.
