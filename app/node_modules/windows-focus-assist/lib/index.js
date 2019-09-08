let lib

var Status = {
    NOT_SUPPORTED: { value: -2, name: "NOT_SUPPORTED" },
    FAILED: { value: -1, name: "FAILED" },
    OFF: { value:0, name: "OFF" },
    PRIORITY_ONLY: { value:1, name: "PRIORITY_ONLY" },
    ALARMS_ONLY: { value:2, name: "ALARMS_ONLY" }
  };

function getFocusAssist () {
  if (process.platform !== 'win32') {
    throw new Error('windows-focus-assist works only on Windows')
  }

  lib = lib || require('bindings')('focus-assist')
  switch (lib.GetFocusAssist()){
      case -2 : return Status.NOT_SUPPORTED;
      case -1 : return Status.FAILED;
      case 0 : return Status.OFF;
      case 1 : return Status.PRIORITY_ONLY;
      case 2 : return Status.ALARMS_ONLY;
      default : return Status.UNKNOWN;
  }
}

module.exports = { getFocusAssist: getFocusAssist }
