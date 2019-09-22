@echo off
cd "%~dp0src\vibrate"
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0build\vibrate.dll" vibrate
del "%~dp0\build\vibrate.h"
xcopy /Y "%~dp0build\vibrate.dll" "%~dp0\..\..\..\..\..\..\build\resources\app.pkg.unpacked\native\vibrate\build\"