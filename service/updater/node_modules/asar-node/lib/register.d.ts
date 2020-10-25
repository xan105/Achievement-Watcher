/** 
 * Hack module and fs API
 * @example
 * You can do something like this.
 * 
 * ``` js
 * require('./path/to/file.asar')
 * require('./path/to/file.asar/subdir/script.js')
 * require('./path/to/file.asar/subdir/config.json')
 * require('./path/to/file.asar/subdir/addon.node')
 * ```
 */ 
export function register(): void;

export function checkRegisterState (): boolean;
