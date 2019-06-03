@echo off
%~dp0openssl.exe dgst -sha384 -binary "%~1" | %~dp0openssl.exe base64 -A
echo.
PAUSE