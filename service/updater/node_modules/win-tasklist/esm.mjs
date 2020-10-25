//ES Module Wrapper
//https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages

import module from './tasklist.cjs';
export const getProcessInfo = module.getProcessInfo;
export const isProcessRunning = module.isProcessRunning;
export const hasProcess = module.hasProcess;
export default module;