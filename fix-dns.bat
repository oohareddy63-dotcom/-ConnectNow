@echo off
echo ========================================
echo Fixing DNS for MongoDB Atlas Connection
echo ========================================
echo.
echo This will:
echo 1. Flush DNS cache
echo 2. Reset network adapter
echo 3. Change DNS to Google DNS
echo.
echo NOTE: You may need to run this as Administrator
echo.
pause
echo.
echo Step 1: Flushing DNS cache...
ipconfig /flushdns
echo.
echo Step 2: Resetting Winsock...
netsh winsock reset
echo.
echo Step 3: Setting Google DNS...
echo.
echo Please follow these manual steps:
echo 1. Open Control Panel
echo 2. Go to Network and Sharing Center
echo 3. Click on your active network connection
echo 4. Click Properties
echo 5. Select "Internet Protocol Version 4 (TCP/IPv4)"
echo 6. Click Properties
echo 7. Select "Use the following DNS server addresses"
echo 8. Enter:
echo    Preferred DNS: 8.8.8.8
echo    Alternate DNS: 8.8.4.4
echo 9. Click OK
echo.
echo ========================================
echo After changing DNS, restart your computer
echo Then run: start-dev.bat
echo ========================================
echo.
pause
