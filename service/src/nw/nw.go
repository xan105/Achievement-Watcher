//go:generate goversioninfo -platform-specific=true -icon=..\..\icon.ico -manifest=manifest.xml
package main

import(
    "log"
    "os"
    "os/exec"
    "syscall"
    "path/filepath"
)

func fileExist(path string) bool {
    _, err := os.Stat(path)
    if err == nil { return true }
    if os.IsNotExist(err) { return false }
    return true
}

func contains(a []string, x string) bool {
    for _, n := range a {
        if x == n { return true }
    }
    return false
}

func main(){ 

    ex, err := os.Executable()
    if err != nil {
        log.Fatal(err)
    }
    root := filepath.Dir(ex)
    
    bin := os.Args[1]
    allowed := []string{"updater","watchdog"}

    if (contains(allowed,bin)) {
    
      exePath := filepath.Join(root,bin+".exe")

      if fileExist(exePath) {

        cmd := exec.Command(exePath)
        cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
        err := cmd.Start()
        if err != nil {
           log.Fatal(err)
        }

      }
    }

}