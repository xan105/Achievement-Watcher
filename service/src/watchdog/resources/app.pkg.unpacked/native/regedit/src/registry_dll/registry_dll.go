//go:generate goversioninfo -platform-specific=true
package main

import (
  "C"
	"golang.org/x/sys/windows/registry"
	"encoding/hex"
	"strconv"
	"strings"
)

func GetHKEY(root string) registry.Key {

	var HKEY registry.Key
	
	if (root == "HKCR"){ 
    HKEY = registry.CLASSES_ROOT
	} else if (root == "HKCU") {
    HKEY = registry.CURRENT_USER
  }else if (root == "HKLM") {
  	HKEY = registry.LOCAL_MACHINE
  }else if (root == "HKU") { 
  	HKEY = registry.USERS
  }else if (root == "HKCC") { 
    HKEY = registry.CURRENT_CONFIG
	}
	
	return HKEY

}

//export RegKeyExists
func RegKeyExists(root *C.char, key *C.char) C.uint {

	var result int
	HKEY := GetHKEY(C.GoString(root))

	k, err := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
  
  if err != nil {
		result = 0
  } else {
    result = 1
  }

  defer k.Close()
		 
  return C.uint(result)

}

//export RegListAllSubkeys
func RegListAllSubkeys(root *C.char, key *C.char) *C.char {
  
  var result string
  HKEY := GetHKEY(C.GoString(root))
  
  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE | registry.ENUMERATE_SUB_KEYS)
		 defer k.Close()
  
  list, _ := k.ReadSubKeyNames(-1)
  
  result = strings.Join(list[:], ",")
  
  return C.CString(result)
  
}

//export RegListAllValues
func RegListAllValues(root *C.char, key *C.char) *C.char {
  
  var result string
  HKEY := GetHKEY(C.GoString(root))
  
  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE | registry.ENUMERATE_SUB_KEYS)
		 defer k.Close()
  
  list, _ := k.ReadValueNames(-1)
  
  result = strings.Join(list[:], ",")
  
  return C.CString(result)
  
}

//export RegQueryStringValue
func RegQueryStringValue(root *C.char, key *C.char, name *C.char) *C.char { // REG_SZ & REG_EXPAND_SZ

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 result, _, _ = k.GetStringValue(C.GoString(name))
 
	return C.CString(result)
}

//export RegQueryStringValueAndExpand
func RegQueryStringValueAndExpand(root *C.char, key *C.char, name *C.char) *C.char { // REG_EXPAND_SZ (expands environment-variable strings)

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 s, _, _ := k.GetStringValue(C.GoString(name))
     result, _ = registry.ExpandString(s)
     
	return C.CString(result)
}

//export RegQueryBinaryValue
func RegQueryBinaryValue(root *C.char, key *C.char, name *C.char) *C.char { //REG_BINARY

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 x, _, _ := k.GetBinaryValue(C.GoString(name))
 
  result = hex.EncodeToString(x)
 
	return C.CString(result)

}

//export RegQueryIntegerValue
func RegQueryIntegerValue(root *C.char, key *C.char, name *C.char) *C.char { //REG_DWORD & REG_QWORD

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 i, _, _ := k.GetIntegerValue(C.GoString(name))
 
  result = strconv.FormatUint(i, 10)
 
	return C.CString(result)

}

//export RegWriteStringValue
func RegWriteStringValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.SetStringValue(C.GoString(name), C.GoString(value))
}

//export RegWriteExpandStringValue
func RegWriteExpandStringValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.SetExpandStringValue(C.GoString(name), C.GoString(value))
}

//export RegWriteBinaryValue
func RegWriteBinaryValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    x, _ := hex.DecodeString(C.GoString(value))
    k.SetBinaryValue(C.GoString(name), x)
}

//export RegWriteDwordValue
func RegWriteDwordValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    i, _ := strconv.ParseUint(C.GoString(value), 10, 32)
    k.SetDWordValue(C.GoString(name), uint32(i))
}

//export RegWriteQwordValue
func RegWriteQwordValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    i, _ := strconv.ParseUint(C.GoString(value), 10, 64)
    k.SetQWordValue(C.GoString(name), i)
}

//export RegDeleteKey
func RegDeleteKey (root *C.char, key *C.char) {

  HKEY := GetHKEY(C.GoString(root))

  registry.DeleteKey(HKEY, C.GoString(key)) 

}

//export RegDeleteKeyValue
func RegDeleteKeyValue (root *C.char, key *C.char, name *C.char) {

  HKEY := GetHKEY(C.GoString(root))

  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.DeleteValue(C.GoString(name))

}

func main() {}