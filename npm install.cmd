@echo off
cd "%~dp0app"
npm i
npm run-script native-rebuild
cd "%~dp0server"
npm i
cd "%~dp0service\src\updater"
npm i
cd "%~dp0service\src\watchdog"
npm i
PAUSE