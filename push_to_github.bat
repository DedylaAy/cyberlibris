@echo off
cd /d "%~dp0"
echo ========================================================
echo   CyberLibris - Upload to GitHub: DedylaAy/cyberlibris
echo ========================================================
echo.
echo Running: git push -u origin main ...
echo.
git push -u origin main
echo.
echo ========================================================
echo   Done! Check output above.
echo ========================================================
pause
