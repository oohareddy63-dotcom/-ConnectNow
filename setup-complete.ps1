Write-Host "🚀 Setting up ConnectNow Application..." -ForegroundColor Green
Write-Host ""

# Step 1: Start MongoDB
Write-Host "Step 1: Starting MongoDB..." -ForegroundColor Yellow
if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" -Force | Out-Null
}
Start-Process -FilePath "mongod" -ArgumentList "--dbpath", "./data", "--port", "27017", "--logpath", "./data/mongod.log" -NoNewWindow
Write-Host "✅ MongoDB started" -ForegroundColor Green

# Wait for MongoDB to start
Write-Host "⏳ Waiting for MongoDB to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
Set-Location "backend"
npm install

# Step 3: Seed database
Write-Host "Step 3: Seeding database with sample data..." -ForegroundColor Yellow
npm run seed

# Step 4: Start backend
Write-Host "Step 4: Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -NoNewWindow

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Start frontend
Write-Host "Step 5: Starting frontend..." -ForegroundColor Yellow
Set-Location "../frontend"
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -NoNewWindow

Write-Host ""
Write-Host "✅ ConnectNow Application Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🗄️ MongoDB: mongodb://localhost:27017/connectnow" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Test Users:" -ForegroundColor Yellow
Write-Host "   - Username: john_doe, Password: password123" -ForegroundColor White
Write-Host "   - Username: jane_smith, Password: password123" -ForegroundColor White
Write-Host "   - Username: admin, Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test API: http://localhost:8000/api/test" -ForegroundColor Cyan
Write-Host "🔍 Test DB: http://localhost:8000/api/test-db" -ForegroundColor Cyan
Write-Host ""

# Open browser automatically
Start-Process "http://localhost:3000"

Write-Host "🌐 Opening frontend in browser..." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
