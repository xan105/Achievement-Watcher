# SteamID for Node.js

This module provides a SteamID object which makes SteamID usage and conversion easy.

# Installation

Install it from npm:

    $ npm install steamid

# Brief Overview

A SteamID is made up of four parts: its **universe**, its **type**, its **instance**, and its **account ID**.

- **Universe**: Currently, there are 5 universes. A universe is a unique instance of Steam. You'll probably only be interacting with the public universe, which is the regular Steam. Only Valve employees can access non-public universes.
- **Type**: A SteamID's type determines what it identifies. The most common type is *individual*, for user accounts. There are also other types such as *clans* (Steam groups), *gameservers*, and more.
- **Instance**: The instance ID isn't usually used.
- **Account ID**: This represents a unique account of a type.

There are enums for each type available under the root SteamID object.

## Universes

```js
SteamID.Universe = {
	"INVALID": 0,
	"PUBLIC": 1,
	"BETA": 2,
	"INTERNAL": 3,
	"DEV": 4
};
```

## Types

```js
SteamID.Type = {
	"INVALID": 0,
	"INDIVIDUAL": 1,
	"MULTISEAT": 2,
	"GAMESERVER": 3,
	"ANON_GAMESERVER": 4,
	"PENDING": 5,
	"CONTENT_SERVER": 6,
	"CLAN": 7,
	"CHAT": 8,
	"P2P_SUPER_SEEDER": 9,
	"ANON_USER": 10
};
```

## Instances

```js
SteamID.Instance = {
	"ALL": 0,
	"DESKTOP": 1,
	"CONSOLE": 2,
	"WEB": 4
};
```

# SteamID Creation

You can create a SteamID object from a Steam2 rendered ID, a Steam3 rendered ID, a SteamID64, or from the four parts that make up a SteamID.

## Steam2 ID

```js
var SteamID = require('steamid');
var sid = new SteamID('STEAM_0:0:23071901');
```

## Steam3 ID

```js
var SteamID = require('steamid');
var sid = new SteamID('[U:1:46143802]');
```

## SteamID64

```js
var SteamID = require('steamid');
var sid = new SteamID('76561198006409530');
```

## SteamID Parts

```js
var SteamID = require('steamid');
var sid = new SteamID();
sid.universe = SteamID.Universe.PUBLIC;
sid.type = SteamID.Type.INDIVIDUAL;
sid.instance = SteamID.Instance.DESKTOP;
sid.accountid = 46143802;
```

## Individual AccountID

There's a shorthand method for creating an individual SteamID with the desktop instance in the public universe given an accountid:

```js
var SteamID = require('steamid');
var sid = SteamID.fromIndividualAccountID(46143802);
```

# Using a SteamID

Once you have created a `SteamID` object, you can access its properties (`universe`, `type`, `instance`, and `accountid`) or you can convert it between rendered types.

## isValid()

Returns `true` if the object represents a valid SteamID, or `false` if not.

## isGroupChat()

Returns `true` if the `type` of this SteamID is `CHAT`, and it's associated with a Steam group's chat room.

## isLobby()

Returns `true` if the `type` of thie SteamID is `CHAT`, and it's associated with a Steam lobby.

## getSteam2RenderedID([newerFormat])

*Shorthand: `steam2([newerFormat])`*

Returns the Steam2 rendered ID format for individual accounts. Throws an error if the type isn't individual.

If you pass `true` for `newerFormat`, the first digit will be 1 instead of 0 for the public universe.

Example:

```js
var SteamID = require('steamid');
var sid = new SteamID('76561198006409530');
console.log(sid.getSteam2RenderedID()); // STEAM_0:0:23071901
console.log(sid.getSteam2RenderedID(true)); // STEAM_1:0:23071901
```

## getSteam3RenderedID()

*Shorthand: `steam3()`*

Returns the Steam3 rendered ID format.

Examples:

```js
var SteamID = require('steamid');

var sid = new SteamID('76561198006409530');
console.log(sid.getSteam3RenderedID()); // [U:1:46143802]

var gid = new SteamID('103582791434202956');
console.log(gid.getSteam3RenderedID()); // [g:1:4681548]
```

## getSteamID64()

Returns the 64-bit representation of the SteamID.

Examples:

```js
var SteamID = require('steamid');

var sid = new SteamID('[g:1:4681548]');
console.log(sid.getSteamID64()); // 103582791434202956

var sid2 = new SteamID('STEAM_0:0:23071901');
console.log(sid2.getSteamID64()); // 76561198006409530
```

# Tests

Use `npm test` to run the included test suite.
