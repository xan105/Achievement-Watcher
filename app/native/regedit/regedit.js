"use strict";

const { remote } = require('electron');
const path = require('path');
const ffi = require('ffi-napi');

const dll = path.join(remote.app.getAppPath(),"native/regedit/build/regedit.x64.dll").replace('app.asar', 'app.asar.unpacked');

module.exports = ffi.Library(dll, {
   'RegKeyExists': ["int", ["string", "string"]],
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