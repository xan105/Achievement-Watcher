"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug");
var d = debug('@electron/get:proxy');
/**
 * Initializes a third-party proxy module for HTTP(S) requests.
 */
function initializeProxy() {
    try {
        // Code originally from https://github.com/yeoman/yo/blob/b2eea87e/lib/cli.js#L19-L28
        var MAJOR_NODEJS_VERSION = parseInt(process.version.slice(1).split('.')[0], 10);
        if (MAJOR_NODEJS_VERSION >= 10) {
            // `global-agent` works with Node.js v10 and above.
            require('global-agent').bootstrap();
        }
        else {
            // `global-tunnel-ng` works with Node.js v10 and below.
            require('global-tunnel-ng').initialize();
        }
    }
    catch (e) {
        d('Could not load either proxy modules, built-in proxy support not available:', e);
    }
}
exports.initializeProxy = initializeProxy;
//# sourceMappingURL=proxy.js.map