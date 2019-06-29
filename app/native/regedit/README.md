A cgo dll to access Windows registry.<br />
Syntax is inspired from InnoSetup's Pascal Scripting.

Dependencies
============

- golang.org/x/sys/windows/registry

Start `dependencies.cmd` or <br />
`>_ go get golang.org/x/sys/windows/registry`<br />

`go get` requires git for windows installed and in PATH.


Build me
========

cgo requires a gcc compiler installed and in PATH. <br />
Recommended : http://tdm-gcc.tdragon.net/download
  
Start `build.cmd` or <br />
```
>_ go generate
>_ go build -buildmode=c-shared -o regedit.dll registry_dll
```

API
===

`RegKeyExists`<br />
(root *C.char, key *C.char) C.uint // 0: false | 1: true

`RegListAllSubkeys`<br />
(root *C.char, key *C.char) *C.char // Comma seperated list

`RegListAllValues`<br />
(root *C.char, key *C.char) *C.char // Comma seperated list

`RegQueryStringValue` // REG_SZ & REG_EXPAND_SZ<br />
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryStringValueAndExpand` // REG_EXPAND_SZ (expands environment-variable strings)<br />
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryBinaryValue` //REG_BINARY<br />
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryIntegerValue` //REG_DWORD & REG_QWORD<br />
(root *C.char, key *C.char, name *C.char) *C.char

`RegWriteStringValue`<br />
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteExpandStringValue`<br />
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteBinaryValue`<br />
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteDwordValue`<br />
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteQwordValue`<br />
(root *C.char, key *C.char, name *C.char, value *C.char) 

`RegDeleteKeyValue`<br />
(root *C.char, key *C.char, name *C.char)

Example
=======

Node.js
```js
const path = require('path');
const ffi = require('ffi-napi');

const regedit = ffi.Library(path.resolve(__dirname, "build/regedit.dll"), {
   'RegKeyExists': ["int", ["string", "string"]],
   'RegListAllSubkeys': ["string", ["string", "string"]],
   'RegListAllValues': ["string", ["string", "string"]],
   'RegQueryStringValue': ["string", ["string", "string", "string"]],
   'RegQueryStringValueAndExpand': ["string", ["string", "string", "string"]],
   'RegQueryBinaryValue': ["string", ["string", "string", "string"]],
   'RegQueryIntegerValue': ["string", ["string", "string", "string"]],
   'RegWriteStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteExpandStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteBinaryValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteDwordValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteQwordValue': ["void", ["string", "string", "string", "string"]],
   'RegDeleteKey': ["void", ["string", "string"]],
   'RegDeleteKeyValue': ["void", ["string", "string", "string"]]
});

let example = regedit.RegQueryStringValue("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Store","PrimaryWebAccountId");
console.log(example);

```
