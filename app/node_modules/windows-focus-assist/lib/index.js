let lib

var Status = {
    NOT_SUPPORTED: { value: -2, name: "NOT_SUPPORTED" },
    FAILED: { value: -1, name: "FAILED" },
    OFF: { value:0, name: "OFF" },
    PRIORITY_ONLY: { value:1, name: "PRIORITY_ONLY" },
    ALARMS_ONLY: { value:2, name: "ALARMS_ONLY" }
  };

  var Priority = {
    NOT_SUPPORTED: { value: -2, name: "NOT_SUPPORTED" },
    FAILED: { value: -1, name: "FAILED" },
    NO: { value:0, name: "NO" },
    YES: { value:1, name: "YES" },
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

function isPriority (appUserModelId) {
  if (process.platform !== 'win32') {
    throw new Error('windows-focus-assist works only on Windows')
  }

  lib = lib || require('bindings')('focus-assist')
  switch (lib.IsPriority(appUserModelId)){
      case -2 : return Priority.NOT_SUPPORTED;
      case -1 : return Priority.FAILED;
      case 0 : return Priority.NO;
      case 1 : return Priority.YES;
      default : return Status.UNKNOWN;
  }
}

module.exports = { getFocusAssist: getFocusAssist, isPriority: isPriority }
