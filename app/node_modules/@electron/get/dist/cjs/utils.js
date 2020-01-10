"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var childProcess = require("child_process");
var fs = require("fs-extra");
var os = require("os");
var path = require("path");
function useAndRemoveDirectory(directory, fn) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 2, 4]);
                    return [4 /*yield*/, fn(directory)];
                case 1:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, fs.remove(directory)];
                case 3:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function withTempDirectoryIn(parentDirectory, fn) {
    if (parentDirectory === void 0) { parentDirectory = os.tmpdir(); }
    return __awaiter(this, void 0, void 0, function () {
        var tempDirectoryPrefix, tempDirectory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tempDirectoryPrefix = 'electron-download-';
                    return [4 /*yield*/, fs.mkdtemp(path.resolve(parentDirectory, tempDirectoryPrefix))];
                case 1:
                    tempDirectory = _a.sent();
                    return [2 /*return*/, useAndRemoveDirectory(tempDirectory, fn)];
            }
        });
    });
}
exports.withTempDirectoryIn = withTempDirectoryIn;
function withTempDirectory(fn) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, withTempDirectoryIn(undefined, fn)];
        });
    });
}
exports.withTempDirectory = withTempDirectory;
function normalizeVersion(version) {
    if (!version.startsWith('v')) {
        return "v" + version;
    }
    return version;
}
exports.normalizeVersion = normalizeVersion;
/**
 * Runs the `uname` command and returns the trimmed output.
 */
function uname() {
    return childProcess
        .execSync('uname -m')
        .toString()
        .trim();
}
exports.uname = uname;
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name, from the `process` module information.
 */
function getHostArch() {
    return getNodeArch(process.arch);
}
exports.getHostArch = getHostArch;
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name.
 */
function getNodeArch(arch) {
    if (arch === 'arm') {
        switch (process.config.variables.arm_version) {
            case '6':
                return uname();
            case '7':
            default:
                return 'armv7l';
        }
    }
    return arch;
}
exports.getNodeArch = getNodeArch;
function ensureIsTruthyString(obj, key) {
    if (!obj[key] || typeof obj[key] !== 'string') {
        throw new Error("Expected property \"" + key + "\" to be provided as a string but it was not");
    }
}
exports.ensureIsTruthyString = ensureIsTruthyString;
function isOfficialLinuxIA32Download(platform, arch, version, mirrorOptions) {
    return (platform === 'linux' &&
        arch === 'ia32' &&
        Number(version.slice(1).split('.')[0]) >= 4 &&
        typeof mirrorOptions === 'undefined');
}
exports.isOfficialLinuxIA32Download = isOfficialLinuxIA32Download;
//# sourceMappingURL=utils.js.map