@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo  CyberLibris Web Launcher
echo ===================================================

netstat -ano | findstr :8080 >nul 2>nul
if %ERRORLEVEL% EQU 0 goto :open_browser

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "CyberLibris Server" /min python server.py
    ping -n 2 127.0.0.1 >nul 2>nul
    goto :open_browser
)

start "" "index.html"
exit /b 0

:open_browser
start "" "http://localhost:8080"
exit /b 0