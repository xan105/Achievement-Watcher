cd "%~dp0"\src\registry_dll
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0\build\regedit.dll" registry_dll
PAUSE