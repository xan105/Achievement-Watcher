"use strict";

const ffi = require("ffi-napi");
const ref = require("ref-napi");
const Struct = require("ref-struct-di")(ref);

// Types
const DWORD = ref.types.uint32;
const WORD = ref.types.uint16;
const BYTE = ref.types.uint8;
const SHORT = ref.types.int16;

const XINPUT_GAMEPAD = Struct({ //https://docs.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_gamepad
	wButtons: WORD,
	bLeftTrigger: BYTE,
	bRightTrigger: BYTE,
	sThumbLX: SHORT,
	sThumbLY: SHORT,
	sThumbRX: SHORT,
	sThumbRY: SHORT
});

const XINPUT_STATE = Struct({ //https://docs.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_state
  dwPacketNumber: DWORD,
  Gamepad: ref.refType(XINPUT_GAMEPAD)
});

const XINPUT_VIBRATION = Struct({ //https://docs.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_vibration
  wLeftMotorSpeed: WORD, //low-frequency rumble motor
  wRightMotorSpeed: WORD //high-frequency rumble motor
});

// const
const CONTROLLER_MAX = 4;
const CONTROLLER_MOTOR_SPEED = 65535;
const CONTROLLER_RUMBLE_DURATION = 2500 //~2sec (estimate)

// Xinput init

const Syntax = {
  "XInputEnable": ["void",["bool"]], //1_4,1_3 | https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputenable
  "XInputGetState": [DWORD,[DWORD,ref.refType(XINPUT_STATE)]], //1_4,1_3,9_1_0 | https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputgetstate
  "XInputSetState": [DWORD,[DWORD,ref.refType(XINPUT_VIBRATION)]] // 1_4,9_1_0 | https://docs.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputsetstate
};

const versions = [
"xinput1_4",  //Windows 8
"xinput1_3",  //Windows 7 (DirectX SDK)
"xinput9_1_0" //Windows Vista (Legacy) 
];

let lib;
for (let version of versions)
{
 try{
  lib = ffi.Library(version, Syntax);
  break;
 }catch{ lib = null }
}
if (!lib) throw "ERROR_LOADING_XINPUT";

const XInput = {
  sync: {
    enable: function(enable) 
    {
      lib.XInputEnable(enable);
    },
    getState: function (gamepadIndex = 0)
    {
      if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) throw `Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`;

      let state = new XINPUT_STATE();
      
      const code = lib.XInputGetState(gamepadIndex,state.ref());
      
      if (code === 1167) throw "ERROR_DEVICE_NOT_CONNECTED";
      else if (code !== 0) throw `UNEXPECTED_ERROR (${code})`;

      const gamepad = ref.get(state.ref(),4,XINPUT_GAMEPAD);
      const result = {
          dwPacketNumber: state.dwPacketNumber,
          Gamepad: {
            wButtons: gamepad.wButtons,
            bLeftTrigger: gamepad.bLeftTrigger,
            bRightTrigger: gamepad.bRightTrigger,
            sThumbLX: gamepad.sThumbLX,
            sThumbLY: gamepad.sThumbLY,
            sThumbRX: gamepad.sThumbRX,
            sThumbRY: gamepad.sThumbRY
          }
       };
       
       return result;
    },
    setState: function (lowFrequency, highFrequency, gamepadIndex = 0)
    {
      if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) throw `Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`;
      if (!Number.isInteger(lowFrequency) || ( lowFrequency < 0 || lowFrequency > 100)) throw "Low-frequency rumble range 0-100%.";
      if (!Number.isInteger(highFrequency) || ( highFrequency < 0 || highFrequency > 100)) throw "High-frequency rumble rumble range 0-100%.";

      const forceFeedBack = (i) => (CONTROLLER_MOTOR_SPEED / 100) * i;

      const vibration = new XINPUT_VIBRATION({
        wLeftMotorSpeed : forceFeedBack(lowFrequency),
        wRightMotorSpeed : forceFeedBack(highFrequency)
      });
      
      const code = lib.XInputSetState(gamepadIndex,vibration.ref());
      
      if (code === 1167) throw "ERROR_DEVICE_NOT_CONNECTED";
      else if (code !== 0) throw `UNEXPECTED_ERROR (${code})`;
    },
    rumble: function (option = {})
    {
      const options = {
        force: (option.force && (Number.isInteger(option.force) || Array.isArray(option.force))) ? option.force : [50,25],
        duration: (option.duration && Number.isInteger(option.duration) && option.duration < CONTROLLER_RUMBLE_DURATION && option.duration > 0) ? option.duration : CONTROLLER_RUMBLE_DURATION,
        forceEnableGamepad: option.forceEnableGamepad || false,
        gamepadIndex: (Number.isInteger(option.gamepadIndex) && option.gamepadIndex >= 0 && option.gamepadIndex < CONTROLLER_MAX-1) ? option.gamepadIndex : 0
      };
      
      if (options.forceEnableGamepad) this.enable(true);
      
      if (Array.isArray(options.force) && options.force.length === 2 && options.force.every(i => Number.isInteger(i))) 
      {
        this.setState(options.force[0],options.force[1],options.gamepadIndex);
      } else {
        this.setState(options.force,options.force,options.gamepadIndex);
      }
      
      //Block the event-loop for the rumble duration
      const end = Date.now() + options.duration;
      while (Date.now() < end) {/*Do nothing*/} 
      
      this.setState(0,0,options.gamepadIndex); //State reset
    },
    isConnected: function (gamepadIndex = 0)
    {
      if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) throw `Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`;
      try{
        this.getState(gamepadIndex)
        return true;
      }catch{
        return false;
      }
    },
    listConnected: function ()
    {
      let connected = Array(CONTROLLER_MAX).fill(false);
      for (let i=0; i < CONTROLLER_MAX-1; i++) if (this.isConnected(i)) connected[i] = true;
      return connected;
    }
  }, //End of sync
  enable: function(enable) 
  {
   return new Promise((resolve,reject) => {
     lib.XInputEnable.async(enable,(err) => {
        if(err) return reject(err);
        else return resolve();
     });
   });
  },
  getState: function (gamepadIndex = 0)
  {
    return new Promise((resolve,reject) => {
      if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) return reject(`Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`);

      let state = new XINPUT_STATE();
      
      lib.XInputGetState.async(gamepadIndex,state.ref(), (err, code) => {
        if(err) return reject(err);
        if(code === 0) 
        {
          const gamepad = ref.get(state.ref(),4,XINPUT_GAMEPAD);
          const result = {
            dwPacketNumber: state.dwPacketNumber,
            Gamepad: {
              wButtons: gamepad.wButtons,
              bLeftTrigger: gamepad.bLeftTrigger,
              bRightTrigger: gamepad.bRightTrigger,
              sThumbLX: gamepad.sThumbLX,
              sThumbLY: gamepad.sThumbLY,
              sThumbRX: gamepad.sThumbRX,
              sThumbRY: gamepad.sThumbRY
            }
          };
          return resolve(result);
        }
        else if (code === 1167)
        {
          return reject("ERROR_DEVICE_NOT_CONNECTED");
        }
        else
        {
          return reject(`UNEXPECTED_ERROR (${code})`);
        }
      });
   });
  },
  setState: function (lowFrequency, highFrequency, gamepadIndex = 0)
  {
    return new Promise((resolve,reject) => {
      if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) throw `Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`;
      if (!Number.isInteger(lowFrequency) || ( lowFrequency < 0 || lowFrequency > 100)) throw "Low-frequency rumble range 0-100%.";
      if (!Number.isInteger(highFrequency) || ( highFrequency < 0 || highFrequency > 100)) throw "High-frequency rumble rumble range 0-100%.";

      const forceFeedBack = (i) => (CONTROLLER_MOTOR_SPEED / 100) * i;

      const vibration = new XINPUT_VIBRATION({
        wLeftMotorSpeed : forceFeedBack(lowFrequency),
        wRightMotorSpeed : forceFeedBack(highFrequency)
      });
      
      lib.XInputSetState.async(gamepadIndex,vibration.ref(), (err, code) => {
        if(err) return reject(err);
        if(code === 0) 
        {
          return resolve();
        }
        else if (code === 1167)
        {
          return reject("ERROR_DEVICE_NOT_CONNECTED");
        }
        else
        {
          return reject(`UNEXPECTED_ERROR (${code})`);
        }
      });
    });
  },
  rumble: async function (option = {})
  {
    const options = {
      force: (option.force && (Number.isInteger(option.force) || Array.isArray(option.force))) ? option.force : [50,25],
      duration: (option.duration && Number.isInteger(option.duration) && option.duration < CONTROLLER_RUMBLE_DURATION && option.duration > 0) ? option.duration : CONTROLLER_RUMBLE_DURATION,
      forceEnableGamepad: option.forceEnableGamepad || false,
      gamepadIndex: (Number.isInteger(option.gamepadIndex) && option.gamepadIndex >= 0 && option.gamepadIndex < CONTROLLER_MAX-1) ? option.gamepadIndex : 0
    };
      
    if (options.forceEnableGamepad) await this.enable(true);
      
    if (Array.isArray(options.force) && options.force.length === 2 && options.force.every(i => Number.isInteger(i))) 
    {
      await this.setState(options.force[0],options.force[1],options.gamepadIndex);
    } else {
      await this.setState(options.force,options.force,options.gamepadIndex);
    }
    await new Promise(resolve => setTimeout(resolve, options.duration)).catch(()=>{}); //Keep the event-loop alive for the rumble duration 
    await this.setState(0,0,options.gamepadIndex); //State reset
  },
  isConnected: async function (gamepadIndex = 0)
  {
    if (!Number.isInteger(gamepadIndex) || ( gamepadIndex < 0 || gamepadIndex > CONTROLLER_MAX-1)) throw `Index of the user's controller must be a value from 0 to ${CONTROLLER_MAX-1}.`;
    try{
      await this.getState(gamepadIndex)
      return true;
    }catch{
      return false;
    }
  },
  listConnected: async function ()
  {
    let connected = Array(CONTROLLER_MAX).fill(false);
    for (let i=0; i < CONTROLLER_MAX-1; i++) if (await this.isConnected(i)) connected[i] = true;
    return connected;
  }
};

module.exports = XInput;