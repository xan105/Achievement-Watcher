@echo off
cd "%~dp0src\souvenir"
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0build\souvenir.dll" souvenir
del "%~dp0\build\souvenir.h"
xcopy /Y "%~dp0build\souvenir.dll" "%~dp0\..\..\..\..\..\..\build\resources\app.pkg.unpacked\native\souvenir\build\" 
xcopy /Y "%~dp0\..\..\..\..\node_modules\ffi-napi\build\Release\ffi_bindings.node" "%~dp0\..\..\..\..\..\..\build\"
xcopy /Y "%~dp0\..\..\..\..\node_modules\ref-napi\build\Release\binding.node" "%~dp0\..\..\..\..\..\..\build\"