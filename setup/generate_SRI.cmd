@echo off
openssl.exe dgst -sha384 -binary "%~1" | openssl base64 -A
echo.
PAUSE