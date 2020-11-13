@echo off

rcedit-x64.exe ..\{{app}}\node\node.exe --set-icon %~dp0..\{{app}}\icon.ico --set-version-string "ProductName" "Achievement Watcher" --set-version-string "FileDescription" "Achievement Watcher"