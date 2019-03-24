@echo off
net session>nul 2>&1
if %errorlevel%==0 (goto RUN) else ( goto MESSAGE )
:RUN
    SCHTASKS /Create /TN "Achievement Watcher Upgrade Daily" /SC DAILY /TR "\"%~dp0nw.exe\" updater" /RL HIGHEST /RI 60 /DU 24:00 /F
    SCHTASKS /Create /TN "Achievement Watcher Upgrade OnLogon" /SC ONLOGON /DELAY 0010:00 /TR "\"%~dp0nw.exe\" updater" /RL HIGHEST /F
    goto end
:MESSAGE
    echo "You need to run this script with admin privileges"
    goto end
:end
    PAUSE