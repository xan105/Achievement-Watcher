get-uv-event-loop-napi-h
=================================
### C function to get the current libuv event loop for N-API

[![Greenkeeper badge](https://badges.greenkeeper.io/node-ffi-napi/get-uv-event-loop-napi-h.svg)](https://greenkeeper.io/)

[![NPM Version](https://img.shields.io/npm/v/get-uv-event-loop-napi-h.svg?style=flat)](https://npmjs.org/package/get-uv-event-loop-napi-h)
[![NPM Downloads](https://img.shields.io/npm/dm/get-uv-event-loop-napi-h.svg?style=flat)](https://npmjs.org/package/get-uv-event-loop-napi-h)
[![Build Status](https://travis-ci.org/node-ffi-napi/get-uv-event-loop-napi-h.svg?style=flat&branch=master)](https://travis-ci.org/node-ffi-napi/get-uv-event-loop-napi-h?branch=master)
[![Coverage Status](https://coveralls.io/repos/node-ffi-napi/get-uv-event-loop-napi-h/badge.svg?branch=master)](https://coveralls.io/r/node-ffi-napi/get-uv-event-loop-napi-h?branch=master)
[![Dependency Status](https://david-dm.org/node-ffi-napi/get-uv-event-loop-napi-h.svg?style=flat)](https://david-dm.org/node-ffi-napi/get-uv-event-loop-napi-h)

Installation
------------

Install with `npm`:

``` bash
$ npm install get-uv-event-loop-napi-h
```

Usage
-----

In your `binding.gyp`:

```python
    'include_dirs': ["<!@(node -p \"require('get-uv-event-loop-napi-h').include\")"],
```

(Just have `"<!@(node -p \"require('get-uv-event-loop-napi-h').include\")"` somewhere in that list, ok?)

In your C code:

```c
#include <get-uv-event-loop-napi.h>

uv_loop_t* loop = get_uv_event_loop(env);
```
