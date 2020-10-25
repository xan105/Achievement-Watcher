//ES Module Wrapper
//https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages

import module from './xinput.cjs';
export const sync = module.sync;
export const enable = module.enable;
export const getState = module.getState;
export const setState = module.setState;
export const rumble = module.rumble;
export const isConnected = module.isConnected;
export const listConnected = module.listConnected;