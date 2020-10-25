//ES Module Wrapper
//https://nodejs.org/api/esm.html#esm_dual_commonjs_es_module_packages

import module from './request.cjs';
export const post = module.post;
export const get = module.get;
export const head = module.head;
export const getJson = module.getJson;
export const getXml = module.getXml;
export const upload = module.post;
export const download = module.download;
export default module;