@echo off
rem npm install -g asar
rem npm install -g json
cd "%~dp0"
rmdir "{{app}}\resources" /s /q
mkdir "{{app}}\resources"
mkdir ..\temp
xcopy /SY /EXCLUDE:asar.ignore ..\app ..\temp
echo CLEANING FOR PRODUCTION
echo -----------------------
cd "..\temp\"
call json -I -f package.json -e "this.name='Achievement-Watcher'"
call npm prune --production
call json -I -f package.json -e "this.name='Achievement Watcher'"
echo PACKING TO ASAR
echo ---------------
call json -I -f package.json -e "this.config.debug=false"
cd "..\setup\{{app}}"
call asar pack ../../temp/ resources/app.asar --unpack {*.node,*.dll}
echo CLEANING TEMP
echo -------------
rmdir "..\..\temp\" /s /q