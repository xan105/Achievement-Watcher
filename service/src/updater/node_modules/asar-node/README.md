# asar-node

Enable `require('./path/to/any-node-project.asar')` & `require('./path/to/any-node-project.asar/any/file')` in your nodejs app.

## Usage

``` bash
$ npm install -g asar-node
```

Exists `./path/to/any-node-project.asar`

``` bash
$ asar-node ./path/to/any-node-project # OK!
$ asar-node ./path/to/any-node-project.asar # OK!

$ asar-node ./path/to/any-node-project.asar/any/file # OK!
$ asar-node ./path/to/any-node-project.asar/any/file.js # OK!
$ asar-node ./path/to/any-node-project.asar/any/file.json # OK!
$ asar-node ./path/to/any-node-project.asar/any/file.node # OK!
```

Or

```js
require('asar-node')

require('./path/to/any-node-project') // like require a nodejs directory
// or require('./path/to/any-node-project.asar')
require('./path/to/any-node-project.asar/any/file')
```

If require a asar file, make sure there is `package.json` and `main` field or `index.js` / `index.json` / `index.node` in the asar root.

You can also pack `node_modules` into `node_modules.asar` instead of packing the hole project folder into an asar file.

## Note

* **Only these fs api functions are available in asar file and you should use absolute path. Also `child_process` api is not supported in asar file.**

  * fs.readFileSync()
  * fs.createReadStream()
  * fs.statSync()
  * fs.existsSync()
  * fs.realpathSync()

* **If your nodejs project use C++ native addons, please unpack it from asar file by specifying `--unpack=*.node` to [asar CLI](https://www.npmjs.com/package/asar)**
* **Express or Koa serving static file in asar file is not supported, but you can unpack the static file folder.**
* **`asar-node` can not be used in Electron. It's unnecessary.**
