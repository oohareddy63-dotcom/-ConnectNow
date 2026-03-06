@echo off
echo ========================================
echo ConnectNow Development Server Starter
echo ========================================
echo.

echo Starting Backend Server...
start "ConnectNow Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "ConnectNow Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
