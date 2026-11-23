@echo off
chcp 65001 > nul
title CyberLibris Server Stopper

echo =========================================================================
echo  Остановка локального сервера CyberLibris (Порт 8080)...
echo =========================================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    echo Завершение процесса с PID %%a...
    taskkill /F /PID %%a > nul 2>&1
)

echo.
echo [OK] Сервер остановлен. Порт 8080 освобожден.
timeout /t 2 > nul
exit
