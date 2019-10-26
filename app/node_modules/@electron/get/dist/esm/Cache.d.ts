export declare class Cache {
    private cacheRoot;
    constructor(cacheRoot?: string);
    private getCachePath;
    getPathForFileInCache(url: string, fileName: string): Promise<string | null>;
    putFileInCache(url: string, currentPath: string, fileName: string): Promise<string>;
}
