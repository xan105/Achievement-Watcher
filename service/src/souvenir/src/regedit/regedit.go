package regedit

import (
	"golang.org/x/sys/windows/registry"
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

func RegQueryStringValue(root string, key string, name string) string { // REG_SZ & REG_EXPAND_SZ

	var result string
	HKEY := GetHKEY(root)

	k, _ := registry.OpenKey(HKEY , key, registry.QUERY_VALUE)
		 defer k.Close()
		 result, _, _ = k.GetStringValue(name)
		 
	result, _ = registry.ExpandString(result)
 
	return result
}