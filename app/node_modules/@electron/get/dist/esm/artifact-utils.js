import { ensureIsTruthyString } from './utils';
var BASE_URL = 'https://github.com/electron/electron/releases/download/';
var NIGHTLY_BASE_URL = 'https://github.com/electron/nightlies/releases/download/';
export function getArtifactFileName(details) {
    ensureIsTruthyString(details, 'artifactName');
    if (details.isGeneric) {
        return details.artifactName;
    }
    ensureIsTruthyString(details, 'arch');
    ensureIsTruthyString(details, 'platform');
    ensureIsTruthyString(details, 'version');
    return [
        details.artifactName,
        details.version,
        details.platform,
        details.arch
    ].concat((details.artifactSuffix ? [details.artifactSuffix] : [])).join('-') + ".zip";
}
function mirrorVar(name, options, defaultValue) {
    // Convert camelCase to camel_case for env var reading
    var lowerName = name.replace(/([a-z])([A-Z])/g, function (_, a, b) { return a + "_" + b; }).toLowerCase();
    return (process.env["NPM_CONFIG_ELECTRON_" + lowerName.toUpperCase()] ||
        process.env["npm_config_electron_" + lowerName] ||
        process.env["npm_package_config_electron_" + lowerName] ||
        process.env["ELECTRON_" + lowerName.toUpperCase()] ||
        options[name] ||
        defaultValue);
}
export function getArtifactRemoteURL(details) {
    var opts = details.mirrorOptions || {};
    var base = mirrorVar('mirror', opts, BASE_URL);
    if (details.version.includes('nightly')) {
        base = mirrorVar('nightly_mirror', opts, NIGHTLY_BASE_URL);
    }
    var path = mirrorVar('customDir', opts, details.version);
    var file = mirrorVar('customFilename', opts, getArtifactFileName(details));
    return "" + base + path + "/" + file;
}
//# sourceMappingURL=artifact-utils.js.map