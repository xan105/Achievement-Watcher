//ES Module Wrapper
//https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages

import module from './fs.cjs';
export const readFile = module.readFile;
export const writeFile = module.writeFile;
export const copyFile = module.copyFile;
export const rm = module.rm;
export const mv = module.mv;
export const exists = module.exists;
export const existsAndIsOlderThan = module.existsAndIsOlderThan;
export const stats = module.stats;
export const mkdir = module.mkdir;
export const rmdir = module.rmdir;
export const hashFile = module.hashFile;