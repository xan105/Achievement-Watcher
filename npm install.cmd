@echo off
cd "%~dp0app"
npm ci
npm run-script native-rebuild
cd "%~dp0service\updater"
npm ci
cd "%~dp0service\watchdog"
npm ci
cd "%~dp0server\v2"
npm ci
PAUSE