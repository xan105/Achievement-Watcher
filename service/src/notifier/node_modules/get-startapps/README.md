Dependency-free promise based wrapper for the Powershell Get-StartApps command.

Install & Usage example
-----------------------

```$ npm install get-startapps```

Look for all the Xbox app :

```js
const ps = require('get-startapps');

ps("Xbox").then((result)=>{

  console.log(result);
  
  /* OUTPUT
[ { name: ' Xbox Game Bar',
    appid: ' Microsoft.XboxGamingOverlay_8wekyb3d8bbwe!App' },
  { name: ' Xbox Console Companion',
    appid: ' Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp' } ] 
  */

}).catch((err)=>{
  console.error(err);
});
```

List them all :

```js
const ps = require('get-startapps');

ps().then((result)=>{

  console.log(result);
  
  /* OUTPUT
 [{ name: ' Google Chrome', appid: ' Chrome' },
  { name: ' GitHub Desktop', appid: ' com.squirrel.GitHubDesktop.GitHubDesktop' }, 
      ... 335 more items ]
  */

}).catch((err)=>{
  console.error(err);
});
```

Has GamingOverlay (Microsoft.Xbox**GamingOverlay**_8wekyb3d8bbwe!App) ? :

```js
const ps = require('get-startapps');

ps.has({id:"GamingOverlay"}).then((result)=>{

  console.log(result); // true or false

}).catch((err)=>{
  console.error(err);
});
```

API
---

- **module.exports = async(search = {})**

*Parameters:*

- a string => equivalent of `Get-StartApps` then search all the result for matching result name or appid.
- an object {name: "xxx", id: "yyy"} =>  **Use Powershell to search** for either matching name, appid or both.
- Nothing/Empty object => equivalent of `Get-StartApps` : List all available apps.

*Returns:*

An array of object :

```
[  { name: '',
    appid: '' }, ... ]
```

On error returns an empty array.


*Example:*
```js
const ps = require('get-startapps');

await ps("Xbox"); //string
await ps({name:"Game Bar",id:"GamingOverlay"}); //object both properties
await ps({name:"Microsoft"}); //object by name only
await ps({id:"Xbox"}); //object by id only
await ps(); //nothing list all

```

- **module.exports.has = async(search = {})**

*Parameters:*

- a string => equivalent of `Get-StartApps` then search all the result for matching result name or appid.
- an object {name: "xxx", id: "yyy"} =>  **Use Powershell to search** for either matching name, appid or both.

*Returns:*

Bool true/false

On error or unvalid parameters returns false.


*Example:*
```js

const ps = require('get-startapps');

await ps.has("Xbox"); //string
await ps.has({id:"GamingOverlay", name: "Game Bar"}); //object both properties
await ps.has({id:"GamingOverlay"}); //object by name only
await ps.has({name:"Game Bar"}); //object by id only

```
