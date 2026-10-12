@echo off
echo ===================================================================
echo Starting Smart Family Financial System (Backend + Frontend)
echo ===================================================================
echo Starting Spring Boot Backend on http://localhost:8083 ...
start "SmartFamily Backend" "%~dp0start-backend.bat"

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak >nul

echo Starting React Frontend on http://localhost:5173 ...
start "SmartFamily Frontend" "%~dp0start-frontend.bat"

echo.
echo Both servers have been launched in separate windows!
echo Backend:  http://localhost:8083
echo Frontend: http://localhost:5173
echo.
pause
