"use strict";

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

const HKEY = ["HKCR","HKCU","HKLM","HKU","HKCC"];

function goPath(p) {
  return p.replace(/([\/])/g,"\\");
}

module.exports.RegKeyExists = function(root,key) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
    
    let result = regedit.RegKeyExists(root,goPath(key));
    
    return result === 1 ? true : false;
  
}

module.exports.RegListAllSubkeys = function(root,key) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    let list = regedit.RegListAllSubkeys(root,goPath(key));
    
    if (list) {
    
      let result = list.split(",");
      
      return (result.length > 0) ? result : null;
      
    } else {
      return null;
    }
  
}

module.exports.RegListAllValues = function(root,key) {
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    let list = regedit.RegListAllValues(root,goPath(key));
    
    if (list) {
    
      let result = list.split(",");
      
      if (result.length > 0) {
        
        return result.sort(function(a, b){ //Alphabetical sort to match regedit view
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
        })
        
      } else {
        return null;
      }
      
    } else {
      return null;
    }
}

module.exports.RegQueryStringValue = function(root,key,name) { // REG_SZ & REG_EXPAND_SZ
    
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        
    return regedit.RegQueryStringValue(root,goPath(key),name);
}

module.exports.RegQueryStringValueAndExpand = function(root,key,name) { // REG_EXPAND_SZ (expands environment-variable strings)
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        
    return regedit.RegQueryStringValueAndExpand (root,goPath(key),name);
}

module.exports.RegQueryBinaryValue = function(root,key,name) { //REG_BINARY
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        
    return regedit.RegQueryBinaryValue (root,goPath(key),name);
}

module.exports.RegQueryIntegerValue = function(root,key,name) { //REG_DWORD & REG_QWORD
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        
    return regedit.RegQueryIntegerValue (root,goPath(key),name);
}

module.exports.RegWriteStringValue = function(root,key,name,value) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegWriteStringValue(root,goPath(key),name,value.toString());
}

module.exports.RegWriteExpandStringValue = function(root,key,name,value) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegWriteExpandStringValue(root,goPath(key),name,value.toString());
}

module.exports.RegWriteBinaryValue = function(root,key,name,value) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegWriteBinaryValue(root,goPath(key),name,value.toString());
}

module.exports.RegWriteDwordValue = function(root,key,name,value) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegWriteDwordValue(root,goPath(key),name,value.toString());
}

module.exports.RegWriteQwordValue = function(root,key,name,value) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegWriteQwordValue(root,goPath(key),name,value.toString());
}

module.exports.RegDeleteKey = function(root,key) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegDeleteKey(root,goPath(key));
}

module.exports.RegDeleteKeyValue = function(root,key,name) {
  
    if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
  
    regedit.RegDeleteKeyValue(root,goPath(key),name);
}