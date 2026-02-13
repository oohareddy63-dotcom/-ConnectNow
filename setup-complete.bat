@echo off
echo Setting up ConnectNow Application...
echo.

echo Step 1: Starting MongoDB...
mkdir data 2>nul
start /B mongod --dbpath ./data --port 27017 --logpath ./data/mongod.log

echo Step 2: Installing dependencies...
cd backend
call npm install

echo Step 3: Seeding database with sample data...
call npm run seed

echo Step 4: Starting backend server...
start /B cmd /k "npm start"

echo Step 5: Starting frontend...
cd ../frontend
start /B cmd /k "npm start"

echo.
echo ✅ ConnectNow Application Setup Complete!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 🗄️ MongoDB: mongodb://localhost:27017/connectnow
echo.
echo 📱 Test Users:
echo    - Username: john_doe, Password: password123
echo    - Username: jane_smith, Password: password123
echo    - Username: admin, Password: admin123
echo.
pause
