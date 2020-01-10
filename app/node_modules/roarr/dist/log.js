"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _boolean = require("boolean");

var _globalthis = _interopRequireDefault(require("globalthis"));

var _detectNode = _interopRequireDefault(require("detect-node"));

var _factories = require("./factories");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const globalThis = (0, _globalthis.default)();
globalThis.ROARR = (0, _factories.createRoarrInititialGlobalState)(globalThis.ROARR || {});
let logFactory = _factories.createLogger;

if (_detectNode.default) {
  // eslint-disable-next-line no-process-env
  const enabled = (0, _boolean.boolean)(process.env.ROARR_LOG || '');

  if (!enabled) {
    logFactory = _factories.createMockLogger;
  }
}

var _default = logFactory(message => {
  if (globalThis.ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = JSON.stringify(message);
    globalThis.ROARR.write(body);
  }
});

exports.default = _default;
//# sourceMappingURL=log.js.map