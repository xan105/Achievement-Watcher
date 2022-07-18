//From notification-state-ffi: https://github.com/xan105/node-notification-state-ffi | MIT license 
//CJS. Use above lib when moving to ESM 
const { promisify } = require('util'); 
const ffi require('ffi-napi');
const ref require('ref-napi');

const QUERY_USER_NOTIFICATION_STATE = {
  1: "QUNS_NOT_PRESENT", //A screen saver is displayed, the machine is locked, or a nonactive Fast User Switching session is in progress
  2: "QUNS_BUSY", //A fullscreen application is running or Presentation Settings are applied
  3: "QUNS_RUNNING_D3D_FULL_SCREEN", //A fullscreen (exclusive mode) Direct3D application is running
  4: "QUNS_PRESENTATION_MODE", //The user has activated Windows presentation settings to block notifications and pop-up messages
  5: "QUNS_ACCEPTS_NOTIFICATIONS", //None of the other states are found, notifications can be freely sent
  6: "QUNS_QUIET_TIME", //The current user is in 'quiet time', which is the first hour after a new user logs into his or her account for the first time after an operating system upgrade or clean installation
  7: "QUNS_APP" //A Windows Store app is running fullscreen
};
  
const lib = ffi.Library("shell32.dll", {
  SHQueryUserNotificationState: ["long", ["*int32"]],
});

async function queryUserNotificationState(){
  let pquns = ref.alloc(ref.types.int32); //allocate 4 bytes for the output data
  const hres = await promisify(lib.SHQueryUserNotificationState.async)(pquns);
  if (hres < 0) {
    const code = new Uint32Array([hres])[0]; //cast signed to unsigned
    throw new Error(`Error ${code} (0x${code.toString(16).toUpperCase()})`)
  }
  const state = pquns.deref(); //get the actual number
  return QUERY_USER_NOTIFICATION_STATE[state];
}

async function isFullscreenAppRunning(){
  try{
    const state = await queryUserNotificationState();
    return ["QUNS_BUSY", "QUNS_RUNNING_D3D_FULL_SCREEN", "QUNS_PRESENTATION_MODE", "QUNS_APP"].includes(state);
  }catch{
    return false;
  }
}

module.exports = { isFullscreenAppRunning };