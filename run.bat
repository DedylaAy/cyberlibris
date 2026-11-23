@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===================================================
echo  CyberLibris Web Launcher
echo ===================================================

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python not found in PATH, launching direct file mode...
    start "" "index.html"
    exit /b 0
)

echo Preparing server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

start "CyberLibris Server" /min python server.py 8080
ping -n 2 127.0.0.1 >nul 2>nul

echo Opening browser at http://127.0.0.1:8080 ...
start "" "http://127.0.0.1:8080"
exit /b 0