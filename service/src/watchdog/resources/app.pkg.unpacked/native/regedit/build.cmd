@echo off
cd "%~dp0"\src\registry_dll
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0build\regedit.dll" registry_dll
del "%~dp0\build\regedit.h"
xcopy /Y "%~dp0build\regedit.dll" "%~dp0\..\..\..\..\..\..\build\resources\app.pkg.unpacked\native\regedit\build\" 