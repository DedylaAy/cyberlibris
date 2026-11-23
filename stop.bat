@echo off
setlocal
cd /d "%~dp0"

echo Stopping CyberLibris Server on port 8080...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo Done.
exit /b 0