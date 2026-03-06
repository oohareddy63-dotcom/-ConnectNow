@echo off
echo ========================================
echo ConnectNow - Database Seeding
echo ========================================
echo.
echo This will:
echo - Clear all existing users and meetings
echo - Add 10 sample users
echo - Add 15 sample meetings
echo.
pause
echo.
echo Starting database seed...
echo.
cd backend
node seed-data.js
echo.
echo ========================================
echo Database seeding complete!
echo ========================================
echo.
echo You can now login with any of the sample users.
echo See SAMPLE-DATA.md for credentials.
echo.
pause
