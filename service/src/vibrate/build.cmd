@echo off
cd "%~dp0src\vibrate"
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0\..\watchdog\vibrate.dll" vibrate
del "%~dp0\..\watchdog\vibrate.h"
xcopy /Y "%~dp0\..\watchdog\vibrate.dll" "%~dp0\..\..\build\" 
xcopy /Y "%~dp0xinput1_4.dll" "%~dp0\..\..\build\" 
xcopy /Y "%~dp0xinput1_4.dll" "%~dp0\..\watchdog\"
PAUSE