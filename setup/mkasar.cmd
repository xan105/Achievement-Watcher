@echo off
rem npm install -g asar
rem npm install -g json
rmdir "prod\resources" /s /q
mkdir "prod\resources"
mkdir ..\temp
xcopy /SY /EXCLUDE:asar.ignore ..\app ..\temp
echo CLEANING FOR PRODUCTION
cd "..\temp\"
call json -I -f package.json -e "this.name='Achievement-Watcher'"
call npm prune --production
call json -I -f package.json -e "this.name='Achievement Watcher'"
echo PACKING TO ASAR
call json -I -f package.json -e "this.config.debug=false"
cd "..\setup\prod"
call asar pack ../../temp/ resources/app.asar --unpack {*.node,*.dll}
echo CLEANING TEMP
rmdir "..\..\temp\" /s /q
PAUSE