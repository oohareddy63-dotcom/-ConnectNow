@echo off
cls
echo ========================================
echo   FIX DNS AND RESTART BACKEND
echo ========================================
echo.
echo This will:
echo 1. Flush DNS cache
echo 2. Restart backend server
echo.
echo ========================================
echo.

echo Step 1: Flushing DNS cache...
ipconfig /flushdns

echo.
echo Step 2: Stopping backend...
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo Step 3: Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Step 4: Starting backend...
cd backend
start "ConnectNow Backend" cmd /k "npm run dev"

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Check the new terminal window.
echo.
echo If you see:
echo   ✅ MONGO Connected DB Host: connectnow.lkol42f.mongodb.net
echo   SUCCESS! MongoDB Atlas connected!
echo.
echo If you still see:
echo   ✅ MONGO Connected to LOCAL DB: localhost
echo   DNS issue persists. Try these:
echo   1. Change DNS to Google DNS (8.8.8.8)
echo   2. Disable VPN
echo   3. Try mobile hotspot
echo   4. See DNS-ISSUE-FIX.md for more solutions
echo.
pause
