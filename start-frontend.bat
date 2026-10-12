@echo off
echo ========================================================
echo Starting Smart Family Financial System - React Frontend
echo ========================================================
cd /d "%~dp0frontend"
call npm run dev -- --host
pause
