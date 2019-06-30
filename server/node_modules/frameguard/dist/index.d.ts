/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface FrameguardOptions {
    action?: string;
    domain?: string;
}
declare const _default: (options?: FrameguardOptions | undefined) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
