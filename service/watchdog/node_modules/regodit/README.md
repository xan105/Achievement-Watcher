Read/Write Windows Registry in Node using ffi-napi with a GoLang c-shared DLL.<br />
This was to demo that you can use GoLang c-shared DLL (Go>=1.10) with ffi.<br />
Syntax is inspired from InnoSetup's Pascal Scripting.

Example
=======

```js

const regedit = require("regodit"); //commonjs
import regedit from 'regodit'; //esm

(async()=>{

  //promise
  const res = await regedit.promises.RegListAllSubkeys("HKCU","Software/Valve");
  console.log(res);
  
  //sync
  const resSync = regedit.RegListAllSubkeys("HKCU","Software/Valve");
  console.log(resSync);

})().catch(console.error);
```

API
===

_Promise are under the "promises" namespace otherwise sync method_

eg: 

- promises.RegListAllSubkeys("HKCU","Software/Valve") //Promise
- RegListAllSubkeys("HKCU","Software/Valve") //Sync

### RegKeyExists 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) bool`

### RegListAllSubkeys
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) string[] | null`
### RegListAllValues 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) string[] | null`
### RegQueryStringValue //REG_SZ & REG_EXPAND_SZ
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

### RegQueryStringValueAndExpand //REG_EXPAND_SZ (expands environment-variables)
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

### RegQueryBinaryValue //REG_BINARY
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

### RegQueryIntegerValue //REG_DWORD & REG_QWORD
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

### RegWriteStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

### RegWriteExpandStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

### RegWriteBinaryValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

### RegWriteDwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

### RegWriteQwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

### RegDeleteKey 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) void`

### RegDeleteKeyValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) void`

Build cgo-dll
=============

### Dependencies

- golang.org/x/sys/windows/registry

Run `lib/go/dependencies.cmd` or <br />
`>_ go get golang.org/x/sys/windows/registry`<br />

`go get` requires git for windows installed and in PATH.

cgo requires a gcc compiler installed and in PATH. <br />
Recommended : http://tdm-gcc.tdragon.net/download
  
### Build  
  
Run `lib/go/build.cmd` or <br />
```
>_ cd src\regodit
>_ go generate
>_ cd ..\
>_ set GOPATH="%~dp0"
>_ go build -buildmode=c-shared -o build\regodit.dll regodit
```
