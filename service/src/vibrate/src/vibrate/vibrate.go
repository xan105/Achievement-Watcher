//go:generate goversioninfo -platform-specific=true
package main

import (
	"time"
	"github.com/tajtiattila/xinput"
	"C"
)

//export vibrate
func vibrate(index C.int, delay C.int, duration C.int, percent C.int) {

  err := xinput.Load()
    if err == nil {
        
      time.Sleep(time.Duration(delay) * time.Second)
      
      force := uint16( (65535 / 100) * int(percent) )
      
      err = xinput.SetState(uint(index), &xinput.Vibration{LeftMotorSpeed: force, RightMotorSpeed: force})
        if err == nil {
            
            time.Sleep(time.Duration(duration) * time.Second)
      
            _ = xinput.SetState(uint(index), &xinput.Vibration{LeftMotorSpeed: 0, RightMotorSpeed: 0})

        }
 
    }

}

func main() {}