"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globalthis = _interopRequireDefault(require("globalthis"));

var _jsonStringifySafe = _interopRequireDefault(require("json-stringify-safe"));

var _sprintfJs = require("sprintf-js");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const globalThis = (0, _globalthis.default)();

const createLogger = (onMessage, parentContext) => {
  // eslint-disable-next-line id-length, unicorn/prevent-abbreviations
  const log = (a, b, c, d, e, f, g, h, i, k) => {
    const time = Date.now();
    const sequence = globalThis.ROARR.sequence++;
    let context;
    let message;

    if (typeof a === 'string') {
      context = _objectSpread({}, parentContext || {});
      message = (0, _sprintfJs.sprintf)(a, b, c, d, e, f, g, h, i, k);
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      context = JSON.parse((0, _jsonStringifySafe.default)(_objectSpread({}, parentContext || {}, {}, a)));
      message = (0, _sprintfJs.sprintf)(b, c, d, e, f, g, h, i, k);
    }

    onMessage({
      context,
      message,
      sequence,
      time,
      version: '1.0.0'
    });
  };

  log.child = context => {
    if (typeof context === 'function') {
      return createLogger(message => {
        if (typeof context !== 'function') {
          throw new TypeError('Unexpected state.');
        }

        onMessage(context(message));
      }, parentContext);
    }

    return createLogger(onMessage, _objectSpread({}, parentContext, {}, context));
  };

  log.getContext = () => {
    return _objectSpread({}, parentContext || {});
  };

  for (const logLevel of Object.keys(_constants.logLevels)) {
    // eslint-disable-next-line id-length, unicorn/prevent-abbreviations
    log[logLevel] = (a, b, c, d, e, f, g, h, i, k) => {
      return log.child({
        logLevel: _constants.logLevels[logLevel]
      })(a, b, c, d, e, f, g, h, i, k);
    };
  } // @see https://github.com/facebook/flow/issues/6705
  // $FlowFixMe


  return log;
};

var _default = createLogger;
exports.default = _default;
//# sourceMappingURL=createLogger.js.map