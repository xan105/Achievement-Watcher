"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const zlib = require("zlib");
class Snap {
    constructor(hash, data) {
        this.hash = hash;
        this.data = data;
    }
}
const takeSnapshot = (dir, relativeTo = dir) => __awaiter(this, void 0, void 0, function* () {
    const snap = {};
    yield Promise.all((yield fs.readdir(dir)).map((child) => __awaiter(this, void 0, void 0, function* () {
        if (child === 'node_modules')
            return;
        const childPath = path.resolve(dir, child);
        const relative = path.relative(relativeTo, childPath);
        if ((yield fs.stat(childPath)).isDirectory()) {
            snap[relative] = yield takeSnapshot(childPath, relativeTo);
        }
        else {
            const data = yield fs.readFile(childPath);
            snap[relative] = new Snap(crypto.createHash('SHA256').update(data).digest('hex'), data);
        }
    })));
    return snap;
});
const writeSnapshot = (diff, dir) => __awaiter(this, void 0, void 0, function* () {
    for (const key in diff) {
        if (diff[key] instanceof Snap) {
            yield fs.mkdirp(path.dirname(path.resolve(dir, key)));
            yield fs.writeFile(path.resolve(dir, key), diff[key].data);
        }
        else {
            yield fs.mkdirp(path.resolve(dir, key));
            yield writeSnapshot(diff[key], dir);
        }
    }
});
const serialize = (snap) => {
    const jsonReady = {};
    for (const key in snap) {
        if (snap[key] instanceof Snap) {
            const s = snap[key];
            jsonReady[key] = {
                __isSnap: true,
                hash: s.hash,
                data: s.data.toString('base64')
            };
        }
        else {
            jsonReady[key] = serialize(snap[key]);
        }
    }
    return jsonReady;
};
const unserialize = (jsonReady) => {
    const snap = {};
    for (const key in jsonReady) {
        if (jsonReady[key].__isSnap) {
            snap[key] = new Snap(jsonReady[key].hash, Buffer.from(jsonReady[key].data, 'base64'));
        }
        else {
            snap[key] = unserialize(jsonReady[key]);
        }
    }
    return snap;
};
exports.cacheModuleState = (dir, cachePath, key) => __awaiter(this, void 0, void 0, function* () {
    const snap = yield takeSnapshot(dir);
    const moduleBuffer = Buffer.from(JSON.stringify(serialize(snap)));
    const zipped = yield new Promise(resolve => zlib.gzip(moduleBuffer, (_, result) => resolve(result)));
    yield fs.mkdirp(cachePath);
    yield fs.writeFile(path.resolve(cachePath, key), zipped);
});
exports.lookupModuleState = (cachePath, key) => __awaiter(this, void 0, void 0, function* () {
    if (yield fs.pathExists(path.resolve(cachePath, key))) {
        return function applyDiff(dir) {
            return __awaiter(this, void 0, void 0, function* () {
                const zipped = yield fs.readFile(path.resolve(cachePath, key));
                const unzipped = yield new Promise(resolve => zlib.gunzip(zipped, (_, result) => resolve(result)));
                const diff = unserialize(JSON.parse(unzipped.toString()));
                yield writeSnapshot(diff, dir);
            });
        };
    }
    return false;
});
//# sourceMappingURL=cache.js.map