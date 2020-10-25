export { addAsarToLookupPaths } from './lib/lookup'
export { register } from './lib/register'

export interface AsarState {
  lookupAsar: boolean;
  registered: boolean;
}

export function getState (): AsarState
