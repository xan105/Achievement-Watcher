@echo off

echo Building service
echo ================
call "%~dp0service\buildme.cmd"
echo Building Setup
echo ==============
call "%~dp0setup\rcedit.cmd"
call "%~dp0setup\mkasar.cmd"
echo COMPILE SETUP
echo -------------
"C:\Program Files (x86)\Inno Setup 5\iscc.exe" "%~dp0setup\AchievementWatcher.iss"
PAUSE