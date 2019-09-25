"use strict";

const util = require('util');
const {exec} = require('child_process');

const priority = {
    "idle": 64,
    "below normal": 16384,
    "normal": 32,
    "above normal": 32768,
    "high priority": 128,
    "real time": 256
};

module.exports.set = async (level,pid = process.pid) => {
  try{
    await util.promisify(exec)('wmic process where "ProcessId=' + pid + '" CALL setpriority '+priority[`${level}`],{windowsHide: true});
  }catch(err){
    throw err;
  } 
}