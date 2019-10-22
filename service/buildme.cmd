@echo off
cd "%~dp0src\nw"
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -ldflags "-H windowsgui" -o "%~dp0\build\nw.exe" nw
call "%~dp0src\watchdog\resources\app.pkg.unpacked\native\souvenir\build.cmd"
call "%~dp0src\watchdog\resources\app.pkg.unpacked\native\vibrate\build.cmd"
call "%~dp0src\watchdog\resources\app.pkg.unpacked\native\regedit\build.cmd"
rem npm i -g pkg
cd "%~dp0src\watchdog"
call npm prune --production
call "%~dp0rcedit-watchdog.cmd"
xcopy /Y "%~dp0\src\watchdog\icon.png" "%~dp0\build\" 
call pkg --targets node12-win-x64 --output "%~dp0build/watchdog.exe" "%~dp0src/watchdog/watchdog.js"
cd "%~dp0src\updater"
call npm prune --production
call "%~dp0rcedit-updater.cmd"
call pkg --targets node12-win-x64 --output "%~dp0build/updater.exe" "%~dp0src/updater/updater.js"