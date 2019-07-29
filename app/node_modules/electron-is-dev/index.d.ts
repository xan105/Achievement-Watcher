/**
Check if [Electron](https://electronjs.org) is running in development.

You can force development mode by setting the `ELECTRON_IS_DEV` environment variable to `1`.

@example
```
import isDev = require('electron-is-dev');

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}
```
*/
declare const electronIsDev: boolean;

export = electronIsDev;
