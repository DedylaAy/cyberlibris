@echo off
chcp 65001 > nul
title CyberLibris Web Application
echo =========================================================================
echo  CyberLibris — Нео-Библиотека & Геймифицированный Хаб Знаний
echo  Дисциплина: Технологии программирования
echo =========================================================================
echo.
echo Запуск локального веб-сервера на Python...
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo Python не найден в системе. Открываем index.html напрямую в браузере...
    start index.html
)
pause
