//ES Module Wrapper
//https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages

import module from './index.cjs';
export const isValidAUMID = module.isValidAUMID;
export const has = module.has;
export default module;