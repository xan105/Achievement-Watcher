# boolean

boolean converts lots of things to boolean.

## Status

| Category         | Status                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Version          | [![npm](https://img.shields.io/npm/v/boolean)](https://www.npmjs.com/package/boolean)                                                      |
| Dependencies     | ![David](https://img.shields.io/david/thenativeweb/boolean)                                                                                |
| Dev dependencies | ![David](https://img.shields.io/david/dev/thenativeweb/boolean)                                                                            |
| Build            | [![CircleCI](https://img.shields.io/circleci/build/github/thenativeweb/boolean)](https://circleci.com/gh/thenativeweb/boolean/tree/master) |
| License          | ![GitHub](https://img.shields.io/github/license/thenativeweb/boolean)                                                                      |

## Installation

```shell
$ npm install boolean
```

## Quick start

First you need to add a reference to boolean in your application:

```javascript
const boolean = require('boolean').default;
```

If you use TypeScript, use the following code instead:

```typescript
import boolean from 'boolean';
```

To verify a value for its boolean value, call the `boolean` function and provide the value in question as parameter.

```javascript
console.log(boolean('true')); // => true
```

The `boolean` function considers the following values to be equivalent to `true`:

-   `true` (boolean)
-   `'true'` (string)
-   `'TRUE'` (string)
-   `'t'` (string)
-   `'T'` (string)
-   `'yes'` (string)
-   `'YES'` (string)
-   `'y'` (string)
-   `'Y'` (string)
-   `'on'` (string)
-   `'ON'` (string)
-   `'1'` (string)
-   `1` (number)

_Please note that if you provide a string, it will be trimmed._

All other values, including `undefined` and `null` are considered to be `false`.

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```shell
$ npx roboter
```
