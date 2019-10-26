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
