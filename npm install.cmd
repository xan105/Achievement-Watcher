@echo off
cd "%~dp0app"
npm i
npm run-script native-rebuild
cd "%~dp0service\updater"
npm i
cd "%~dp0service\watchdog"
npm i
cd "%~dp0server\v2"
npm i
PAUSE