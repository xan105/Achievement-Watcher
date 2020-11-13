@echo off
net session>nul 2>&1
if %errorlevel%==0 (goto RUN) else ( goto MESSAGE )
:RUN
    SCHTASKS /Delete /TN "Achievement Watcher Upgrade Daily" /F
    SCHTASKS /Delete /TN "Achievement Watcher Upgrade OnLogon" /F
    goto end
:MESSAGE
    echo "You need to run this script with admin privileges"
    goto end
:end
    PAUSE