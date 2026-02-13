# 🚀 ConnectNow - Complete Setup Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB Community Server** (for local development)
3. **Git** (optional)

## 🛠️ Quick Start (Recommended)

### Method 1: PowerShell (Windows)
```powershell
# Run this in the project root directory
.\setup-complete.ps1
```

### Method 2: Batch File (Windows)
```cmd
# Run this in the project root directory
setup-complete.bat
```

### Method 3: Manual Setup
```bash
# 1. Start MongoDB
mkdir data
mongod --dbpath ./data --port 27017

# 2. Install backend dependencies
cd backend
npm install

# 3. Seed database with sample data
npm run quick-seed

# 4. Start backend server
npm start

# 5. In another terminal, start frontend
cd ../frontend
npm start
```

## 🌐 Access Points

Once setup is complete:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Test**: http://localhost:8000/api/test
- **Database Test**: http://localhost:8000/api/test-db
- **MongoDB**: mongodb://localhost:27017/connectnow

## 🔑 Default Login Credentials

| Username | Password | Role |
|----------|----------|-------|
| admin | admin123 | Administrator |
| john_doe | password123 | User |
| jane_smith | password123 | User |
| test | test123 | Test User |

## 📱 Sample Meeting Code

- **Meeting Code**: `DEMO123`
- **Title**: Demo Meeting
- **Description**: Sample meeting for testing

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String (default: "Anonymous User"),
  username: String (unique),
  password: String (hashed),
  avatar: String (default: generated),
  isActive: Boolean (default: true),
  lastSeen: Date,
  createdAt: Date
}
```

### Meetings Collection
```javascript
{
  user_id: String,
  meetingCode: String (unique),
  title: String (default: "Untitled Meeting"),
  description: String (default: "No description provided"),
  date: Date,
  duration: Number (minutes),
  participants: Number (default: 1),
  isActive: Boolean (default: true),
  recordingEnabled: Boolean (default: false),
  meetingType: String (video/audio/screen)
}
```

## 🔧 API Endpoints

### User Management
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/register` - User registration
- `GET /api/v1/users/getUserHistory?token={token}` - Get user meeting history
- `POST /api/v1/users/addToHistory` - Add meeting to history

### System Endpoints
- `GET /api/test` - Test API connection
- `GET /api/test-db` - Test database connection

## 🛡️ Security Features

- Password hashing with bcryptjs
- Token-based authentication
- Input validation and sanitization
- CORS enabled
- Rate limiting ready

## 🚨 Troubleshooting

### MongoDB Connection Issues
1. **Local MongoDB**: Ensure MongoDB is running
   ```bash
   mongod --dbpath ./data
   ```

2. **Atlas MongoDB**: Whitelist your IP
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or use 0.0.0.0/0

### Port Conflicts
- Backend uses port 8000
- Frontend uses port 3000
- MongoDB uses port 27017

### Common Errors
1. **"MongoDB not connected"**: Start MongoDB service
2. **"Port already in use"**: Kill existing processes
3. **"Module not found"**: Run `npm install`

## 📁 Project Structure

```
ConnectNow/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── seed-database.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── environments.js
│   └── package.json
├── setup-complete.ps1
├── setup-complete.bat
└── README.md
```

## 🎯 Features

### ✅ Implemented
- User authentication (login/register)
- Video meeting functionality
- Real-time chat
- Screen sharing
- Recording
- Meeting history
- Default data seeding
- Error handling
- Responsive UI

### 🔄 In Progress
- User avatars
- Meeting recordings
- Advanced meeting controls

## 📞 Support

For issues:
1. Check MongoDB connection
2. Verify port availability
3. Check console logs
4. Ensure all dependencies installed

---

**🎉 Happy Video Conferencing with ConnectNow!**
