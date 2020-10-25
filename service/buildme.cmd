@echo off

cd "%~dp0watchdog"
call npm prune --production

cd "%~dp0updater"
call npm prune --production