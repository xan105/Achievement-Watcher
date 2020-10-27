NW: No window
=============

Chainload binary silently (no window) using `SysProcAttr{HideWindow: true}`

Usage
-----

`nw.exe [-config /path/to/config.json]`

If no arg provided default to `./nw.json`

config file: 
```json

{
  "bin": "/path/to/exe", //required
  "args": "",
  "cwd": "./",
  "fileCheck": [
    {"sum": "sha256", "size": 0}, //self(bin_value)
    {"file": "/path/to/file", "sum": "sha256", "size": 0}
  ]
}

```

If for whatever reason you want to show the window then add the following :
```json
{
	...,
	"show": true
}
```

Build
-----

Golang >= go1.12.1 <br/>
Use `buildme.cmd`
