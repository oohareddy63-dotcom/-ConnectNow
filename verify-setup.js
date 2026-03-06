import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 ConnectNow Setup Verification\n');
console.log('='.repeat(50));

let allGood = true;

// Check backend .env file
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ Backend .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('<db_password>')) {
        console.log('⚠️  WARNING: Replace <db_password> with your actual password in backend/.env');
        allGood = false;
    } else if (envContent.includes('MONGO_URI=')) {
        console.log('✅ MONGO_URI is configured');
    } else {
        console.log('❌ MONGO_URI not found in .env file');
        allGood = false;
    }
} else {
    console.log('❌ Backend .env file not found');
    allGood = false;
}

// Check backend node_modules
const backendModules = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(backendModules)) {
    console.log('✅ Backend dependencies installed');
} else {
    console.log('⚠️  Backend dependencies not installed. Run: cd backend && npm install');
    allGood = false;
}

// Check frontend node_modules
const frontendModules = path.join(__dirname, 'frontend', 'node_modules');
if (fs.existsSync(frontendModules)) {
    console.log('✅ Frontend dependencies installed');
} else {
    console.log('⚠️  Frontend dependencies not installed. Run: cd frontend && npm install');
    allGood = false;
}

// Check required files
const requiredFiles = [
    'backend/src/app.js',
    'backend/src/models/user.model.js',
    'backend/src/models/meeting.model.js',
    'frontend/src/environment.js',
    'frontend/src/contexts/AuthContext.jsx'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} not found`);
        allGood = false;
    }
});

console.log('='.repeat(50));

if (allGood) {
    console.log('\n✅ Setup looks good! You can start the servers.\n');
    console.log('Run: npm run dev (in backend folder)');
    console.log('Run: npm start (in frontend folder)');
    console.log('\nOr use: start-dev.bat (Windows) or start-dev.ps1 (PowerShell)\n');
} else {
    console.log('\n⚠️  Please fix the issues above before starting the servers.\n');
    console.log('See MONGODB-SETUP.md for detailed instructions.\n');
}
