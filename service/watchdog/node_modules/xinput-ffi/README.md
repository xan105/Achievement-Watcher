XInput wrapper via [ffi-napi](https://www.npmjs.com/package/ffi-napi)

Quick Examples
==============

```js
const XInput = require("xinput-ffi"); //CommonJS
//OR
import * as XInput from "xinput-ffi"; //ES Module

//Check connected status for all controller
console.log( XInput.sync.listConnected() )
// [true,false,false,false] Only 1st gamepad is connected

XInput.sync.rumble(); //Rumble 1st XInput gamepad
XInput.sync.rumble({force: 100}); //Now with 100% force

//low-frequency rumble motor(left) at 50% 
//and high-frequency rumble motor (right) at 25%
XInput.sync.rumble({force: [50,25]});

(async()=>{

  //Rumble 2nd XInput gamepad shortly for 1sec
  XInput.rumble({duration: 1000, gamepadIndex: 1});

  const state = await XInput.getState();
  console.log(state);
  /* Output:
    {
      dwPacketNumber: 322850,
      Gamepad: { wButtons: 0,
        bLeftTrigger: 0,
        bRightTrigger: 0,
        sThumbLX: 128,
        sThumbLY: 641,
        sThumbRX: -1156,
        sThumbRY: -129
      }
    }
  */
  
  //Set 1st XInput gamepad state to 50% left/right; 
  //Wait 2sec; Reset state to idle
  await XInput.setState(50,50);
  await new Promise(resolve => setTimeout(resolve, 2000)).catch(()=>{});
  await XInput.setState(0,0);
  
  //Set 1st XInput gamepad state to 50% left/right; 
  //Wait 500ms and disable all XInput gamepads
  await XInput.setState(50,50);
  await new Promise(resolve => setTimeout(resolve, 500)).catch(()=>{});
  await XInput.enable(false);

})().catch(console.error);

```

Installation
============

```npm install xinput-ffi```

Prequisites: C/C++ build tools (Visual Studio) and Python 2.7 (node-gyp) in order to build [ffi-napi](https://www.npmjs.com/package/ffi-napi).

API
===

> sync method starts with **sync**._name_ otherwise it's a promise.

### void enable(bool enable)
cf: [XInputEnable](https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputenable) (1_4,1_3)<br />
Enable/Disable all XInput gamepads.

NB:
 - Stop any rumble currently playing when set to false.
 - setState will throw "ERROR_DEVICE_NOT_CONNECTED" when set to false.
 
### obj getState(int [gamepadIndex])
cf: [XInputGetState](https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputgetstate) (1_4,1_3,9_1_0)<br />
Retrieves the current state of the specified controller.

gamepadIndex: Index of the user's controller. Can be a value from 0 to 3.<br />
gamepadIndex defaults to 0 (1st XInput gamepad)<br />
If gamepad is not connected throw "ERROR_DEVICE_NOT_CONNECTED".

Returns an object like a [XINPUT_STATE](https://docs.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_state) structure.

### void setState(int lowFrequency, int highFrequency, int [gamepadIndex])
cf: [XInputSetState](https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputsetstate) (1_4,9_1_0)<br />
Sends data to a connected controller. This function is used to activate the vibration function of a controller.

gamepadIndex: Index of the user's controller. Can be a value from 0 to 3.<br />
gamepadIndex defaults to 0 (1st XInput gamepad)<br />
If gamepad is not connected throw "ERROR_DEVICE_NOT_CONNECTED".

NB:
- You need to keep the event-loop alive otherwise the vibration will terminate with your program.<br />
- You need to reset the state to 0 for both frequency before using setState again.<br />

Both are done for you with **rumble()** see below...

> The following are sugar functions based upon previous functions.

### void rumble(obj [option])
This function is used to activate the vibration function of a controller.<br />

options:
  - force : Rumble force to apply to the motors. 
            Either an integer (both motor with the same value) or an array of 2 integer: [left,right]
            _defaults to [50,25]_
  - duration: Rumble duration in ms. Max: 2500 ms. _defaults to max_
  - forceEnableGamepad: Use **enable()** to force the activation of XInput gamepad before rumble. _defaults to false_
  - gamepadIndex: Index of the user's controller. Can be a value from 0 to 3. _defaults to 0 (1st XInput gamepad)_
  
### bool isConnected(int [gamepadIndex])
whether the specified controller is connected or not.<br />
Returns true/false

### Array listConnected(void)
Returns an array of connected status for all controller.<br />
eg: [true,false,false,false] //Only 1st gamepad is connected

Compatibility
=============

- Windows 8: xinput1_4
- Windows 7 (DirectX SDK): xinput1_3
- Windows Vista (Legacy): xinput9_1_0
