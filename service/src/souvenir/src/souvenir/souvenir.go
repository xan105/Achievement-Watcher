//go:generate goversioninfo -platform-specific=true

package main

 import (
  "log"
  "C"
  "path"
  "screenshot"
  "regedit"
 	"image/png"
 	"os"
 	"fmt"
 	"strings"
 )
 
 //export souvenir
 func souvenir(gameName *C.char, achievementName *C.char) *C.char {
 
  game := clean(C.GoString(gameName),"\\/:*?\"<>|")
  achievement := clean(C.GoString(achievementName),"\\/:*?\"<>|")
  
  bounds := screenshot.GetDisplayBounds(0)

 	img, err := screenshot.CaptureRect(bounds)
 		if err != nil {
 			log.Fatal(err)
 		}
 
  dir := path.Join(regedit.RegQueryStringValue("HKCU","Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders","My Pictures"),game)
  err = os.MkdirAll(dir, os.ModePerm)
 		if err != nil {
 			log.Fatal(err)
 		}
  
   fileName := fmt.Sprintf("%s - %s.png", game, achievement)
   pngPath := path.Join(dir,fileName)
   file, _ := os.Create(pngPath)
   defer file.Close()
   png.Encode(file, img)
   return C.CString(pngPath)
 }
 
 func clean(str, chr string) string {
    return strings.Map(func(r rune) rune {
        if strings.IndexRune(chr, r) < 0 {
            return r
        }
        return -1
    }, str)
 }
 
 func main() {}