@echo off
setlocal
cd /d "%~dp0"

echo Stopping CyberLibris Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo Done.
exit /b 0