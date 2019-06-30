/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
interface ExpectCtOptions {
    maxAge?: number;
    enforce?: boolean;
    reportUri?: string;
}
declare const _default: (options?: ExpectCtOptions | undefined) => (_req: IncomingMessage, res: ServerResponse, next: () => void) => void;
export = _default;
