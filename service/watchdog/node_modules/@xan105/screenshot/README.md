Take a screenshot of the active display in .png

Install
-------

```
npm install https://github.com/xan105/node-cgo-screenshot
//or
npm install xan105/node-cgo-screenshot
```

Example
-------

```js
"use strict"

const screenshot = require("@xan105/screenshot");

screenshot("./path/to/dir","helloWorld").then(console.log).catch(console.error);
```

API
---

`screenshot(string dir, string filename) <promise>string`

Take a screenshot in .png (dir/filename.png)<br/>
Returns png filepath.
