import { Downloader } from './Downloader';
export declare class GotDownloader implements Downloader<any> {
    /**
     * @param options - see [`got#options`](https://github.com/sindresorhus/got#options) for possible keys/values.
     */
    download(url: string, targetFilePath: string, options?: any): Promise<void>;
}
