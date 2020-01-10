# @electron/get

> Download Electron release artifacts

[![CircleCI](https://circleci.com/gh/electron/get.svg?style=svg)](https://circleci.com/gh/electron/get)

## Usage

### Simple: Downloading an Electron Binary ZIP

```typescript
import { download } from '@electron/get';

// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
const zipFilePath = await download('4.0.4');
```

### Advanced: Downloading a macOS Electron Symbol File


```typescript
import { downloadArtifact } from '@electron/get';

// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
const zipFilePath = await downloadArtifact({
  version: '4.0.4',
  platform: 'darwin',
  artifactName: 'electron',
  artifactSuffix: 'symbols',
  arch: 'x64',
});
```

### Specifying a mirror

Anatomy of a download URL, in terms of `mirrorOptions`:

```
https://github.com/electron/electron/releases/download/v4.0.4/electron-v4.0.4-linux-x64.zip
|                                                     |       |                           |
-------------------------------------------------------       -----------------------------
                        |                                                   |
              mirror / nightly_mirror                  |    |         customFilename
                                                       ------
                                                         ||
                                                      customDir
```

Example:

```typescript
import { download } from '@electron/get';

const zipFilePath = await download('4.0.4', {
  mirrorOptions: {
    mirror: 'https://mirror.example.com/electron/',
    customDir: 'custom',
    customFilename: 'unofficial-electron-linux.zip'
  }
});
// Will download from https://mirror.example.com/electron/custom/unofficial-electron-linux.zip

const nightlyZipFilePath = await download('8.0.0-nightly.20190901', {
  mirrorOptions: {
    nightly_mirror: 'https://nightly.example.com/',
    customDir: 'nightlies',
    customFilename: 'nightly-linux.zip'
  }
});
// Will download from https://nightly.example.com/nightlies/nightly-linux.zip
```

## How It Works

This module downloads Electron to a known place on your system and caches it
so that future requests for that asset can be returned instantly.  The cache
locations are:

* Linux: `$XDG_CACHE_HOME` or `~/.cache/electron/`
* MacOS: `~/Library/Caches/electron/`
* Windows: `%LOCALAPPDATA%/electron/Cache` or `~/AppData/Local/electron/Cache/`

By default, the module uses [`got`](https://github.com/sindresorhus/got) as the
downloader. As a result, you can use the same [options](https://github.com/sindresorhus/got#options)
via `downloadOptions`.

### Proxies

Downstream packages should utilize the `initializeProxy` function to add HTTP(S) proxy support. If
the environment variable `ELECTRON_GET_USE_PROXY` is set, it is called automatically. A different
proxy module is used, depending on the version of Node in use, and as such, there are slightly
different ways to set the proxy environment variables. For Node 10 and above,
[`global-agent`](https://github.com/gajus/global-agent#environment-variables) is used. Otherwise,
[`global-tunnel-ng`](https://github.com/np-maintain/global-tunnel#auto-config) is used. Refer to the
appropriate linked module to determine how to configure proxy support.
