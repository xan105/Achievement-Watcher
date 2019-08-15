@echo off
cd "%~dp0src\souvenir"
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0\..\watchdog\souvenir.dll" souvenir
del "%~dp0\..\watchdog\souvenir.h"
xcopy /Y "%~dp0\..\watchdog\souvenir.dll" "%~dp0\..\..\build\" 
xcopy /Y "%~dp0\..\watchdog\node_modules\ffi-napi\build\Release\ffi_bindings.node" "%~dp0\..\..\build\"
xcopy /Y "%~dp0\..\watchdog\node_modules\ref-napi\build\Release\binding.node" "%~dp0\..\..\build\"