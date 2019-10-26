export interface Downloader<T> {
    download(url: string, targetFilePath: string, options: T): Promise<void>;
}
