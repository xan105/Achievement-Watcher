export declare const cacheModuleState: (dir: string, cachePath: string, key: string) => Promise<void>;
export declare const lookupModuleState: (cachePath: string, key: string) => Promise<false | ((dir: string) => Promise<void>)>;
