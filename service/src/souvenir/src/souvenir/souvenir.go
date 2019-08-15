//go:generate goversioninfo -platform-specific=true

package main

 import (
  "C"
  "path"
  "screenshot"
  "regedit"
 	"image/png"
 	"os"
 	"fmt"
 )
 
 //export souvenir
 func souvenir(gameName *C.char, achievementName *C.char) {
 
  bounds := screenshot.GetDisplayBounds(0)

 	img, err := screenshot.CaptureRect(bounds)
 		if err != nil {
 			panic(err)
 		}
 
  dir := path.Join(regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","My Pictures"),C.GoString(gameName))
  err = os.MkdirAll(dir, os.ModePerm)
 		if err != nil {
 			panic(err)
 		}
  
   fileName := fmt.Sprintf("%s - %s.png", C.GoString(gameName), C.GoString(achievementName))
   file, _ := os.Create(path.Join(dir,fileName))
   defer file.Close()
   png.Encode(file, img)
 }
 
 func main() {}