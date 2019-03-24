get-symbol-from-current-process-h
=================================
### C function to get a symbol from the current process

[![NPM Version](https://img.shields.io/npm/v/get-symbol-from-current-process-h.svg?style=flat)](https://npmjs.org/package/get-symbol-from-current-process-h)
[![NPM Downloads](https://img.shields.io/npm/dm/get-symbol-from-current-process-h.svg?style=flat)](https://npmjs.org/package/get-symbol-from-current-process-h)
[![Build Status](https://travis-ci.org/node-ffi-napi/get-symbol-from-current-process-h.svg?style=flat&branch=master)](https://travis-ci.org/node-ffi-napi/get-symbol-from-current-process-h?branch=master)
[![Coverage Status](https://coveralls.io/repos/node-ffi-napi/get-symbol-from-current-process-h/badge.svg?branch=master)](https://coveralls.io/r/node-ffi-napi/get-symbol-from-current-process-h?branch=master)
[![Dependency Status](https://david-dm.org/node-ffi-napi/get-symbol-from-current-process-h.svg?style=flat)](https://david-dm.org/node-ffi-napi/get-symbol-from-current-process-h)

The information presented below is specific to usage for building with `npm` and `gyp`.

Installation
------------

Install with `npm`:

``` bash
$ npm install get-symbol-from-current-process-h
```

Usage
-----

In your `binding.gyp`:

```python
    'include_dirs': ["<!@(node -p \"require('get-symbol-from-current-process-h').include\")"],
```

(Just have `"<!@(node -p \"require('get-symbol-from-current-process-h').include\")"` somewhere in that list, ok?)

In your C code:

```c
#include <get-symbol-from-current-process.h>

void* sym = get_symbol_from_current_process("foobar");
```
