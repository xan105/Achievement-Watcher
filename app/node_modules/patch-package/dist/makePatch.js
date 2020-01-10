"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var path_1 = require("./path");
var spawnSafe_1 = require("./spawnSafe");
var filterFiles_1 = require("./filterFiles");
var fs_extra_1 = require("fs-extra");
var rimraf_1 = require("rimraf");
var fs_extra_2 = require("fs-extra");
var tmp_1 = require("tmp");
var patchFs_1 = require("./patchFs");
var PackageDetails_1 = require("./PackageDetails");
var resolveRelativeFileDependencies_1 = require("./resolveRelativeFileDependencies");
var getPackageResolution_1 = require("./getPackageResolution");
var parse_1 = require("./patch/parse");
var zlib_1 = require("zlib");
function printNoPackageFoundError(packageName, packageJsonPath) {
    console.error("No such package " + packageName + "\n\n  File not found: " + packageJsonPath);
}
function makePatch(_a) {
    var _b;
    var packagePathSpecifier = _a.packagePathSpecifier, appPath = _a.appPath, packageManager = _a.packageManager, includePaths = _a.includePaths, excludePaths = _a.excludePaths, patchDir = _a.patchDir;
    var packageDetails = PackageDetails_1.getPatchDetailsFromCliString(packagePathSpecifier);
    if (!packageDetails) {
        console.error("No such package", packagePathSpecifier);
        return;
    }
    var appPackageJson = require(path_1.join(appPath, "package.json"));
    var packagePath = path_1.join(appPath, packageDetails.path);
    var packageJsonPath = path_1.join(packagePath, "package.json");
    if (!fs_extra_1.existsSync(packageJsonPath)) {
        printNoPackageFoundError(packagePathSpecifier, packageJsonPath);
        process.exit(1);
    }
    var tmpRepo = tmp_1.dirSync({ unsafeCleanup: true });
    var tmpRepoPackagePath = path_1.join(tmpRepo.name, packageDetails.path);
    var tmpRepoNpmRoot = tmpRepoPackagePath.slice(0, -("/node_modules/" + packageDetails.name).length);
    var tmpRepoPackageJsonPath = path_1.join(tmpRepoNpmRoot, "package.json");
    try {
        var patchesDir = path_1.resolve(path_1.join(appPath, patchDir));
        console.info(chalk_1.default.grey("•"), "Creating temporary folder");
        // make a blank package.json
        fs_extra_1.mkdirpSync(tmpRepoNpmRoot);
        fs_extra_1.writeFileSync(tmpRepoPackageJsonPath, JSON.stringify({
            dependencies: (_b = {},
                _b[packageDetails.name] = getPackageResolution_1.getPackageResolution({
                    packageDetails: packageDetails,
                    packageManager: packageManager,
                    appPath: appPath,
                }),
                _b),
            resolutions: resolveRelativeFileDependencies_1.resolveRelativeFileDependencies(appPath, appPackageJson.resolutions || {}),
        }));
        var packageVersion = require(path_1.join(path_1.resolve(packageDetails.path), "package.json")).version;
        // copy .npmrc in case if packages are hosted in private registry
        var npmrcPath = path_1.join(appPath, ".npmrc");
        if (fs_extra_1.existsSync(npmrcPath)) {
            fs_extra_2.copySync(npmrcPath, path_1.join(tmpRepo.name, ".npmrc"));
        }
        if (packageManager === "yarn") {
            console.info(chalk_1.default.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with yarn");
            try {
                // try first without ignoring scripts in case they are required
                // this works in 99.99% of cases
                spawnSafe_1.spawnSafeSync("yarn", ["install", "--ignore-engines"], {
                    cwd: tmpRepoNpmRoot,
                    logStdErrOnError: false,
                });
            }
            catch (e) {
                // try again while ignoring scripts in case the script depends on
                // an implicit context which we havn't reproduced
                spawnSafe_1.spawnSafeSync("yarn", ["install", "--ignore-engines", "--ignore-scripts"], {
                    cwd: tmpRepoNpmRoot,
                });
            }
        }
        else {
            console.info(chalk_1.default.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with npm");
            try {
                // try first without ignoring scripts in case they are required
                // this works in 99.99% of cases
                spawnSafe_1.spawnSafeSync("npm", ["i"], {
                    cwd: tmpRepoNpmRoot,
                    logStdErrOnError: false,
                });
            }
            catch (e) {
                // try again while ignoring scripts in case the script depends on
                // an implicit context which we havn't reproduced
                spawnSafe_1.spawnSafeSync("npm", ["i", "--ignore-scripts"], {
                    cwd: tmpRepoNpmRoot,
                });
            }
        }
        var git = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return spawnSafe_1.spawnSafeSync("git", args, {
                cwd: tmpRepo.name,
                env: { HOME: tmpRepo.name },
            });
        };
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // commit the package
        console.info(chalk_1.default.grey("•"), "Diffing your files with clean files");
        fs_extra_1.writeFileSync(path_1.join(tmpRepo.name, ".gitignore"), "!/node_modules\n\n");
        git("init");
        git("config", "--local", "user.name", "patch-package");
        git("config", "--local", "user.email", "patch@pack.age");
        // remove ignored files first
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        git("add", "-f", packageDetails.path);
        git("commit", "--allow-empty", "-m", "init");
        // replace package with user's version
        rimraf_1.sync(tmpRepoPackagePath);
        fs_extra_2.copySync(packagePath, tmpRepoPackagePath);
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // also remove ignored files like before
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        // stage all files
        git("add", "-f", packageDetails.path);
        // get diff of changes
        var diffResult = git("diff", "--cached", "--no-color", "--ignore-space-at-eol", "--no-ext-diff");
        if (diffResult.stdout.length === 0) {
            console.warn("\u2049\uFE0F  Not creating patch file for package '" + packagePathSpecifier + "'");
            console.warn("\u2049\uFE0F  There don't appear to be any changes.");
            process.exit(1);
            return;
        }
        try {
            parse_1.parsePatchFile(diffResult.stdout.toString());
        }
        catch (e) {
            if (e.message.includes("Unexpected file mode string: 120000")) {
                console.error("\n\u26D4\uFE0F " + chalk_1.default.red.bold("ERROR") + "\n\n  Your changes involve creating symlinks. patch-package does not yet support\n  symlinks.\n  \n  \uFE0FPlease use " + chalk_1.default.bold("--include") + " and/or " + chalk_1.default.bold("--exclude") + " to narrow the scope of your patch if\n  this was unintentional.\n");
            }
            else {
                var outPath = "./patch-package-error.json.gz";
                fs_extra_1.writeFileSync(outPath, zlib_1.gzipSync(JSON.stringify({
                    error: { message: e.message, stack: e.stack },
                    patch: diffResult.stdout.toString(),
                })));
                console.error("\n\u26D4\uFE0F " + chalk_1.default.red.bold("ERROR") + "\n        \n  patch-package was unable to read the patch-file made by git. This should not\n  happen.\n  \n  A diagnostic file was written to\n  \n    " + outPath + "\n  \n  Please attach it to a github issue\n  \n    https://github.com/ds300/patch-package/issues/new?title=New+patch+parse+failed&body=Please+attach+the+diagnostic+file+by+dragging+it+into+here+\uD83D\uDE4F\n  \n  Note that this diagnostic file will contain code from the package you were\n  attempting to patch.\n\n");
            }
            process.exit(1);
            return;
        }
        var packageNames = packageDetails.packageNames
            .map(function (name) { return name.replace(/\//g, "+"); })
            .join("++");
        // maybe delete existing
        patchFs_1.getPatchFiles(patchDir).forEach(function (filename) {
            var deets = PackageDetails_1.getPackageDetailsFromPatchFilename(filename);
            if (deets && deets.path === packageDetails.path) {
                fs_extra_1.unlinkSync(path_1.join(patchDir, filename));
            }
        });
        var patchFileName = packageNames + "+" + packageVersion + ".patch";
        var patchPath = path_1.join(patchesDir, patchFileName);
        if (!fs_extra_1.existsSync(path_1.dirname(patchPath))) {
            // scoped package
            fs_extra_1.mkdirSync(path_1.dirname(patchPath));
        }
        fs_extra_1.writeFileSync(patchPath, diffResult.stdout);
        console.log(chalk_1.default.green("✔") + " Created file " + path_1.join(patchDir, patchFileName));
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        tmpRepo.removeCallback();
    }
}
exports.makePatch = makePatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVBhdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21ha2VQYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF5QjtBQUN6QiwrQkFBK0M7QUFDL0MseUNBQTJDO0FBRTNDLDZDQUFrRDtBQUNsRCxxQ0FNaUI7QUFDakIsaUNBQXVDO0FBQ3ZDLHFDQUFtQztBQUNuQywyQkFBNkI7QUFDN0IscUNBQXlDO0FBQ3pDLG1EQUd5QjtBQUN6QixxRkFBbUY7QUFDbkYsK0RBQTZEO0FBQzdELHVDQUE4QztBQUM5Qyw2QkFBK0I7QUFFL0IsU0FBUyx3QkFBd0IsQ0FDL0IsV0FBbUIsRUFDbkIsZUFBdUI7SUFFdkIsT0FBTyxDQUFDLEtBQUssQ0FDWCxxQkFBbUIsV0FBVyw4QkFFZCxlQUFpQixDQUNsQyxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxFQWN6Qjs7UUFiQyw4Q0FBb0IsRUFDcEIsb0JBQU8sRUFDUCxrQ0FBYyxFQUNkLDhCQUFZLEVBQ1osOEJBQVksRUFDWixzQkFBUTtJQVNSLElBQU0sY0FBYyxHQUFHLDZDQUE0QixDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFFekUsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixDQUFDLENBQUE7UUFDdEQsT0FBTTtLQUNQO0lBQ0QsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFdBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQTtJQUM3RCxJQUFNLFdBQVcsR0FBRyxXQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RCxJQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBRXpELElBQUksQ0FBQyxxQkFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1FBQ2hDLHdCQUF3QixDQUFD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QTtRQUViLHdCQUF3QjtRQUN4Qix1QkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVE7WUFDdEMsSUFBTSxLQUFLLEdBQUcsbURBQWtDLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDMUQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFO2dCQUMvQyxxQkFBVSxDQUFDLFdBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQTthQUNyQztRQUNILENBQUMsQ0FBQyxDQUFBO1FBRUYsSUFBTSxhQUFhLEdBQU0sWUFBWSxTQUFJLGNBQWMsV0FBUSxDQUFBO1FBRS9ELElBQU0sU0FBUyxHQUFHLFdBQUksQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLHFCQUFVLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7WUFDbkMsaUJBQWlCO1lBQ2pCLG9CQUFTLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7U0FDOUI7UUFDRCx3QkFBYSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FDTixlQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBaUIsV0FBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUcsQ0FDcEUsQ0FBQTtLQUNGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLE1BQU0sQ0FBQyxDQUFBO0tBQ1I7WUFBUztRQUNSLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtLQUN6QjtBQUNILENBQUM7QUFoUUQsOEJBZ1FDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgeyBzcGF3blNhZmVTeW5jIH0gZnJvbSBcIi4vc3Bhd25TYWZlXCJcbmltcG9ydCB7IFBhY2thZ2VNYW5hZ2VyIH0gZnJvbSBcIi4vZGV0ZWN0UGFja2FnZU1hbmFnZXJcIlxuaW1wb3J0IHsgcmVtb3ZlSWdub3JlZEZpbGVzIH0gZnJvbSBcIi4vZmlsdGVyRmlsZXNcIlxuaW1wb3J0IHtcbiAgd3JpdGVGaWxlU3luYyxcbiAgZXhpc3RzU3luYyxcbiAgbWtkaXJTeW5jLFxuICB1bmxpbmtTeW5jLFxuICBta2RpcnBTeW5jLFxufSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgc3luYyBhcyByaW1yYWYgfSBmcm9tIFwicmltcmFmXCJcbmltcG9ydCB7IGNvcHlTeW5jIH0gZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCB7IGRpclN5bmMgfSBmcm9tIFwidG1wXCJcbmltcG9ydCB7IGdldFBhdGNoRmlsZXMgfSBmcm9tIFwiLi9wYXRjaEZzXCJcbmltcG9ydCB7XG4gIGdldFBhdGNoRGV0YWlsc0Zyb21DbGlTdHJpbmcsXG4gIGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUsXG59IGZyb20gXCIuL1BhY2thZ2VEZXRhaWxzXCJcbmltcG9ydCB7IHJlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXMgfSBmcm9tIFwiLi9yZXNvbHZlUmVsYXRpdmVGaWxlRGVwZW5kZW5jaWVzXCJcbmltcG9ydCB7IGdldFBhY2thZ2VSZXNvbHV0aW9uIH0gZnJvbSBcIi4vZ2V0UGFja2FnZVJlc29sdXRpb25cIlxuaW1wb3J0IHsgcGFyc2VQYXRjaEZpbGUgfSBmcm9tIFwiLi9wYXRjaC9wYXJzZVwiXG5pbXBvcnQgeyBnemlwU3luYyB9IGZyb20gXCJ6bGliXCJcblxuZnVuY3Rpb24gcHJpbnROb1BhY2thZ2VGb3VuZEVycm9yKFxuICBwYWNrYWdlTmFtZTogc3RyaW5nLFxuICBwYWNrYWdlSnNvblBhdGg6IHN0cmluZyxcbikge1xuICBjb25zb2xlLmVycm9yKFxuICAgIGBObyBzdWNoIHBhY2thZ2UgJHtwYWNrYWdlTmFtZX1cblxuICBGaWxlIG5vdCBmb3VuZDogJHtwYWNrYWdlSnNvblBhdGh9YCxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBhdGNoKHtcbiAgcGFja2FnZVBhdGhTcGVjaWZpZXIsXG4gIGFwcFBhdGgsXG4gIHBhY2thZ2VNYW5hZ2VyLFxuICBpbmNsdWRlUGF0aHMsXG4gIGV4Y2x1ZGVQYXRocyxcbiAgcGF0Y2hEaXIsXG59OiB7XG4gIHBhY2thZ2VQYXRoU3BlY2lmaWVyOiBzdHJpbmdcbiAgYXBwUGF0aDogc3RyaW5nXG4gIHBhY2thZ2VNYW5hZ2VyOiBQYWNrYWdlTWFuYWdlclxuICBpbmNsdWRlUGF0aHM6IFJlZ0V4cFxuICBleGNsdWRlUGF0aHM6IFJlZ0V4cFxuICBwYXRjaERpcjogc3RyaW5nXG59KSB7XG4gIGNvbnN0IHBhY2thZ2VEZXRhaWxzID0gZ2V0UGF0Y2hEZXRhaWxzRnJvbUNsaVN0cmluZyhwYWNrYWdlUGF0aFNwZWNpZmllcilcblxuICBpZiAoIXBhY2thZ2VEZXRhaWxzKSB7XG4gICAgY29uc29sZS5lcnJvcihcIk5vIHN1Y2ggcGFja2FnZVwiLCBwYWNrYWdlUGF0aFNwZWNpZmllcilcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBhcHBQYWNrYWdlSnNvbiA9IHJlcXVpcmUoam9pbihhcHBQYXRoLCBcInBhY2thZ2UuanNvblwiKSlcbiAgY29uc3QgcGFja2FnZVBhdGggPSBqb2luKGFwcFBhdGgsIHBhY2thZ2VEZXRhaWxzLnBhdGgpXG4gIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IGpvaW4ocGFja2FnZVBhdGgsIFwicGFja2FnZS5qc29uXCIpXG5cbiAgaWYgKCFleGlzdHNTeW5jKHBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICBwcmludE5vUGFja2FnZUZvdW5kRXJyb3IocGFja2FnZVBhdGhTcGVjaWZpZXIsIHBhY2thZ2VKc29uUGF0aClcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuXG4gIGNvbnN0IHRtcFJlcG8gPSBkaXJTeW5jKHsgdW5zYWZlQ2xlYW51cDogdHJ1ZSB9KVxuICBjb25zdCB0bXBSZXBvUGFja2FnZVBhdGggPSBqb2luKHRtcFJlcG8ubmFtZSwgcGFja2FnZURldGFpbHMucGF0aClcbiAgY29uc3QgdG1wUmVwb05wbVJvb3QgPSB0bXBSZXBvUGFja2FnZVBhdGguc2xpY2UoXG4gICAgMCxcbiAgICAtYC9ub2RlX21vZHVsZXMvJHtwYWNrYWdlRGV0YWlscy5uYW1lfWAubGVuZ3RoLFxuICApXG5cbiAgY29uc3QgdG1wUmVwb1BhY2thZ2VKc29uUGF0aCA9IGpvaW4odG1wUmVwb05wbVJvb3QsIFwicGFja2FnZS5qc29uXCIpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRjaGVzRGlyID0gcmVzb2x2ZShqb2luKGFwcFBhdGgsIHBhdGNoRGlyKSlcblxuICAgIGNvbnNvbGUuaW5mbyhjaGFsay5ncmV5KFwi4oCiXCIpLCBcIkNyZWF0aW5nIHRlbXBvcmFyeSBmb2xkZXJcIilcblxuICAgIC8vIG1ha2UgYSBibGFuayBwYWNrYWdlLmpzb25cbiAgICBta2RpcnBTeW5jKHRtcFJlcG9OcG1Sb290KVxuICAgIHdyaXRlRmlsZVN5bmMoXG4gICAgICB0bXBSZXBvUGFja2FnZUpzb25QYXRoLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBkZXBlbmRlbmNpZXM6IHtcbiAgICAgICAgICBbcGFja2FnZURldGFpbHMubmFtZV06IGdldFBhY2thZ2VSZXNvbHV0aW9uKHtcbiAgICAgICAgICAgIHBhY2thZ2VEZXRhaWxzLFxuICAgICAgICAgICAgcGFja2FnZU1hbmFnZXIsXG4gICAgICAgICAgICBhcHBQYXRoLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9LFxuICAgICAgICByZXNvbHV0aW9uczogcmVzb2x2ZVJlbGF0aXZlRmlsZURlcGVuZGVuY2llcyhcbiAgICAgICAgICBhcHBQYXRoLFxuICAgICAgICAgIGFwcFBhY2thZ2VKc29uLnJlc29sdXRpb25zIHx8IHt9LFxuICAgICAgICApLFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgY29uc3QgcGFja2FnZVZlcnNpb24gPSByZXF1aXJlKGpvaW4oXG4gICAgICByZXNvbHZlKHBhY2thZ2VEZXRhaWxzLnBhdGgpLFxuICAgICAgXCJwYWNrYWdlLmpzb25cIixcbiAgICApKS52ZXJzaW9uIGFzIHN0cmluZ1xuXG4gICAgLy8gY29weSAubnBtcmMgaW4gY2FzZSBpZiBwYWNrYWdlcyBhcmUgaG9zdGVkIGluIHByaXZhdGUgcmVnaXN0cnlcbiAgICBjb25zdCBucG1yY1BhdGggPSBqb2luKGFwcFBhdGgsIFwiLm5wbXJjXCIpXG4gICAgaWYgKGV4aXN0c1N5bmMobnBtcmNQYXRoKSkge1xuICAgICAgY29weVN5bmMobnBtcmNQYXRoLCBqb2luKHRtcFJlcG8ubmFtZSwgXCIubnBtcmNcIikpXG4gICAgfVxuXG4gICAgaWYgKHBhY2thZ2VNYW5hZ2VyID09PSBcInlhcm5cIikge1xuICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICBjaGFsay5ncmV5KFwi4oCiXCIpLFxuICAgICAgICBgSW5zdGFsbGluZyAke3BhY2thZ2VEZXRhaWxzLm5hbWV9QCR7cGFja2FnZVZlcnNpb259IHdpdGggeWFybmAsXG4gICAgICApXG4gICAgICB0cnkge1xuICAgICAgICAvLyB0cnkgZmlyc3Qgd2l0aG91dCBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhleSBhcmUgcmVxdWlyZWRcbiAgICAgICAgLy8gdGhpcyB3b3JrcyBpbiA5OS45OSUgb2YgY2FzZXNcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgeWFybmAsIFtcImluc3RhbGxcIiwgXCItLWlnbm9yZS1lbmdpbmVzXCJdLCB7XG4gICAgICAgICAgY3dkOiB0bXBSZXBvTnBtUm9vdCxcbiAgICAgICAgICBsb2dTdGRFcnJPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gdHJ5IGFnYWluIHdoaWxlIGlnbm9yaW5nIHNjcmlwdHMgaW4gY2FzZSB0aGUgc2NyaXB0IGRlcGVuZHMgb25cbiAgICAgICAgLy8gYW4gaW1wbGljaXQgY29udGV4dCB3aGljaCB3ZSBoYXZuJ3QgcmVwcm9kdWNlZFxuICAgICAgICBzcGF3blNhZmVTeW5jKFxuICAgICAgICAgIGB5YXJuYCxcbiAgICAgICAgICBbXCJpbnN0YWxsXCIsIFwiLS1pZ25vcmUtZW5naW5lc1wiLCBcIi0taWdub3JlLXNjcmlwdHNcIl0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY3dkOiB0bXBSZXBvTnBtUm9vdCxcbiAgICAgICAgICB9LFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgY2hhbGsuZ3JleShcIuKAolwiKSxcbiAgICAgICAgYEluc3RhbGxpbmcgJHtwYWNrYWdlRGV0YWlscy5uYW1lfUAke3BhY2thZ2VWZXJzaW9ufSB3aXRoIG5wbWAsXG4gICAgICApXG4gICAgICB0cnkge1xuICAgICAgICAvLyB0cnkgZmlyc3Qgd2l0aG91dCBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhleSBhcmUgcmVxdWlyZWRcbiAgICAgICAgLy8gdGhpcyB3b3JrcyBpbiA5OS45OSUgb2YgY2FzZXNcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgbnBtYCwgW1wiaVwiXSwge1xuICAgICAgICAgIGN3ZDogdG1wUmVwb05wbVJvb3QsXG4gICAgICAgICAgbG9nU3RkRXJyT25FcnJvcjogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHRyeSBhZ2FpbiB3aGlsZSBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhlIHNjcmlwdCBkZXBlbmRzIG9uXG4gICAgICAgIC8vIGFuIGltcGxpY2l0IGNvbnRleHQgd2hpY2ggd2UgaGF2bid0IHJlcHJvZHVjZWRcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgbnBtYCwgW1wiaVwiLCBcIi0taWdub3JlLXNjcmlwdHNcIl0sIHtcbiAgICAgICAgICBjd2Q6IHRtcFJlcG9OcG1Sb290LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdpdCA9ICguLi5hcmdzOiBzdHJpbmdbXSkgPT5cbiAgICAgIHNwYXduU2FmZVN5bmMoXCJnaXRcIiwgYXJncywge1xuICAgICAgICBjd2Q6IHRtcFJlcG8ubmFtZSxcbiAgICAgICAgZW52OiB7IEhPTUU6IHRtcFJlcG8ubmFtZSB9LFxuICAgICAgfSlcblxuICAgIC8vIHJlbW92ZSBuZXN0ZWQgbm9kZV9tb2R1bGVzIGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG4gICAgLy8gcmVtb3ZlIC5naXQganVzdCB0byBiZSBzYWZlXG4gICAgcmltcmFmKGpvaW4odG1wUmVwb1BhY2thZ2VQYXRoLCBcIm5vZGVfbW9kdWxlc1wiKSlcblxuICAgIC8vIGNvbW1pdCB0aGUgcGFja2FnZVxuICAgIGNvbnNvbGUuaW5mbyhjaGFsay5ncmV5KFwi4oCiXCIpLCBcIkRpZmZpbmcgeW91ciBmaWxlcyB3aXRoIGNsZWFuIGZpbGVzXCIpXG4gICAgd3JpdGVGaWxlU3luYyhqb2luKHRtcFJlcG8ubmFtZSwgXCIuZ2l0aWdub3JlXCIpLCBcIiEvbm9kZV9tb2R1bGVzXFxuXFxuXCIpXG4gICAgZ2l0KFwiaW5pdFwiKVxuICAgIGdpdChcImNvbmZpZ1wiLCBcIi0tbG9jYWxcIiwgXCJ1c2VyLm5hbWVcIiwgXCJwYXRjaC1wYWNrYWdlXCIpXG4gICAgZ2l0KFwiY29uZmlnXCIsIFwiLS1sb2NhbFwiLCBcInVzZXIuZW1haWxcIiwgXCJwYXRjaEBwYWNrLmFnZVwiKVxuXG4gICAgLy8gcmVtb3ZlIGlnbm9yZWQgZmlsZXMgZmlyc3RcbiAgICByZW1vdmVJZ25vcmVkRmlsZXModG1wUmVwb1BhY2thZ2VQYXRoLCBpbmNsdWRlUGF0aHMsIGV4Y2x1ZGVQYXRocylcblxuICAgIGdpdChcImFkZFwiLCBcIi1mXCIsIHBhY2thZ2VEZXRhaWxzLnBhdGgpXG4gICAgZ2l0KFwiY29tbWl0XCIsIFwiLS1hbGxvdy1lbXB0eVwiLCBcIi1tXCIsIFwiaW5pdFwiKVxuXG4gICAgLy8gcmVwbGFjZSBwYWNrYWdlIHdpdGggdXNlcidzIHZlcnNpb25cbiAgICByaW1yYWYodG1wUmVwb1BhY2thZ2VQYXRoKVxuXG4gICAgY29weVN5bmMocGFja2FnZVBhdGgsIHRtcFJlcG9QYWNrYWdlUGF0aClcblxuICAgIC8vIHJlbW92ZSBuZXN0ZWQgbm9kZV9tb2R1bGVzIGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG4gICAgLy8gcmVtb3ZlIC5naXQganVzdCB0byBiZSBzYWZlXG4gICAgcmltcmFmKGpvaW4odG1wUmVwb1BhY2thZ2VQYXRoLCBcIm5vZGVfbW9kdWxlc1wiKSlcblxuICAgIC8vIGFsc28gcmVtb3ZlIGlnbm9yZWQgZmlsZXMgbGlrZSBiZWZvcmVcbiAgICByZW1vdmVJZ25vcmVkRmlsZXModG1wUmVwb1BhY2thZ2VQYXRoLCBpbmNsdWRlUGF0aHMsIGV4Y2x1ZGVQYXRocylcblxuICAgIC8vIHN0YWdlIGFsbCBmaWxlc1xuICAgIGdpdChcImFkZFwiLCBcIi1mXCIsIHBhY2thZ2VEZXRhaWxzLnBhdGgpXG5cbiAgICAvLyBnZXQgZGlmZiBvZiBjaGFuZ2VzXG4gICAgY29uc3QgZGlmZlJlc3VsdCA9IGdpdChcbiAgICAgIFwiZGlmZlwiLFxuICAgICAgXCItLWNhY2hlZFwiLFxuICAgICAgXCItLW5vLWNvbG9yXCIsXG4gICAgICBcIi0taWdub3JlLXNwYWNlLWF0LWVvbFwiLFxuICAgICAgXCItLW5vLWV4dC1kaWZmXCIsXG4gICAgKVxuXG4gICAgaWYgKGRpZmZSZXN1bHQuc3Rkb3V0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBg4oGJ77iPICBOb3QgY3JlYXRpbmcgcGF0Y2ggZmlsZSBmb3IgcGFja2FnZSAnJHtwYWNrYWdlUGF0aFNwZWNpZmllcn0nYCxcbiAgICAgIClcbiAgICAgIGNvbnNvbGUud2Fybihg4oGJ77iPICBUaGVyZSBkb24ndCBhcHBlYXIgdG8gYmUgYW55IGNoYW5nZXMuYClcbiAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlUGF0Y2hGaWxlKGRpZmZSZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKFxuICAgICAgICAoZSBhcyBFcnJvcikubWVzc2FnZS5pbmNsdWRlcyhcIlVuZXhwZWN0ZWQgZmlsZSBtb2RlIHN0cmluZzogMTIwMDAwXCIpXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXG7im5TvuI8gJHtjaGFsay5yZWQuYm9sZChcIkVSUk9SXCIpfVxuXG4gIFlvdXIgY2hhbmdlcyBpbnZvbHZlIGNyZWF0aW5nIHN5bWxpbmtzLiBwYXRjaC1wYWNrYWdlIGRvZXMgbm90IHlldCBzdXBwb3J0XG4gIHN5bWxpbmtzLlxuICBcbiAg77iPUGxlYXNlIHVzZSAke2NoYWxrLmJvbGQoXCItLWluY2x1ZGVcIil9IGFuZC9vciAke2NoYWxrLmJvbGQoXG4gICAgICAgICAgXCItLWV4Y2x1ZGVcIixcbiAgICAgICAgKX0gdG8gbmFycm93IHRoZSBzY29wZSBvZiB5b3VyIHBhdGNoIGlmXG4gIHRoaXMgd2FzIHVuaW50ZW50aW9uYWwuXG5gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb3V0UGF0aCA9IFwiLi9wYXRjaC1wYWNrYWdlLWVycm9yLmpzb24uZ3pcIlxuICAgICAgICB3cml0ZUZpbGVTeW5jKFxuICAgICAgICAgIG91dFBhdGgsXG4gICAgICAgICAgZ3ppcFN5bmMoXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIGVycm9yOiB7IG1lc3NhZ2U6IGUubWVzc2FnZSwgc3RhY2s6IGUuc3RhY2sgfSxcbiAgICAgICAgICAgICAgcGF0Y2g6IGRpZmZSZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxu4puU77iPICR7Y2hhbGsucmVkLmJvbGQoXCJFUlJPUlwiKX1cbiAgICAgICAgXG4gIHBhdGNoLXBhY2thZ2Ugd2FzIHVuYWJsZSB0byByZWFkIHRoZSBwYXRjaC1maWxlIG1hZGUgYnkgZ2l0LiBUaGlzIHNob3VsZCBub3RcbiAgaGFwcGVuLlxuICBcbiAgQSBkaWFnbm9zdGljIGZpbGUgd2FzIHdyaXR0ZW4gdG9cbiAgXG4gICAgJHtvdXRQYXRofVxuICBcbiAgUGxlYXNlIGF0dGFjaCBpdCB0byBhIGdpdGh1YiBpc3N1ZVxuICBcbiAgICBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXMvbmV3P3RpdGxlPU5ldytwYXRjaCtwYXJzZStmYWlsZWQmYm9keT1QbGVhc2UrYXR0YWNoK3RoZStkaWFnbm9zdGljK2ZpbGUrYnkrZHJhZ2dpbmcraXQraW50bytoZXJlK/CfmY9cbiAgXG4gIE5vdGUgdGhhdCB0aGlzIGRpYWdub3N0aWMgZmlsZSB3aWxsIGNvbnRhaW4gY29kZSBmcm9tIHRoZSBwYWNrYWdlIHlvdSB3ZXJlXG4gIGF0dGVtcHRpbmcgdG8gcGF0Y2guXG5cbmApXG4gICAgICB9XG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VOYW1lcyA9IHBhY2thZ2VEZXRhaWxzLnBhY2thZ2VOYW1lc1xuICAgICAgLm1hcChuYW1lID0+IG5hbWUucmVwbGFjZSgvXFwvL2csIFwiK1wiKSlcbiAgICAgIC5qb2luKFwiKytcIilcblxuICAgIC8vIG1heWJlIGRlbGV0ZSBleGlzdGluZ1xuICAgIGdldFBhdGNoRmlsZXMocGF0Y2hEaXIpLmZvckVhY2goZmlsZW5hbWUgPT4ge1xuICAgICAgY29uc3QgZGVldHMgPSBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKGZpbGVuYW1lKVxuICAgICAgaWYgKGRlZXRzICYmIGRlZXRzLnBhdGggPT09IHBhY2thZ2VEZXRhaWxzLnBhdGgpIHtcbiAgICAgICAgdW5saW5rU3luYyhqb2luKHBhdGNoRGlyLCBmaWxlbmFtZSkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHBhdGNoRmlsZU5hbWUgPSBgJHtwYWNrYWdlTmFtZXN9KyR7cGFja2FnZVZlcnNpb259LnBhdGNoYFxuXG4gICAgY29uc3QgcGF0Y2hQYXRoID0gam9pbihwYXRjaGVzRGlyLCBwYXRjaEZpbGVOYW1lKVxuICAgIGlmICghZXhpc3RzU3luYyhkaXJuYW1lKHBhdGNoUGF0aCkpKSB7XG4gICAgICAvLyBzY29wZWQgcGFja2FnZVxuICAgICAgbWtkaXJTeW5jKGRpcm5hbWUocGF0Y2hQYXRoKSlcbiAgICB9XG4gICAgd3JpdGVGaWxlU3luYyhwYXRjaFBhdGgsIGRpZmZSZXN1bHQuc3Rkb3V0KVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYCR7Y2hhbGsuZ3JlZW4oXCLinJRcIil9IENyZWF0ZWQgZmlsZSAke2pvaW4ocGF0Y2hEaXIsIHBhdGNoRmlsZU5hbWUpfWAsXG4gICAgKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHRocm93IGVcbiAgfSBmaW5hbGx5IHtcbiAgICB0bXBSZXBvLnJlbW92ZUNhbGxiYWNrKClcbiAgfVxufVxuIl19