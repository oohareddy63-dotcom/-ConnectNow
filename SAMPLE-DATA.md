# 📊 Sample Data - ConnectNow Database

**Date Added:** February 24, 2026  
**Database:** Local MongoDB (connectnow)

---

## ✅ Database Successfully Seeded!

Your MongoDB database now contains:
- **10 Sample Users** (ready to login)
- **15 Sample Meetings** (with various dates)

---

## 👥 Sample Users

All users have the same password for easy testing: `password123`

| # | Name | Username | Password |
|---|------|----------|----------|
| 1 | John Doe | `john.doe` | `password123` |
| 2 | Jane Smith | `jane.smith` | `password123` |
| 3 | Mike Johnson | `mike.johnson` | `password123` |
| 4 | Sarah Williams | `sarah.williams` | `password123` |
| 5 | David Brown | `david.brown` | `password123` |
| 6 | Emily Davis | `emily.davis` | `password123` |
| 7 | Robert Miller | `robert.miller` | `password123` |
| 8 | Lisa Anderson | `lisa.anderson` | `password123` |
| 9 | James Wilson | `james.wilson` | `password123` |
| 10 | Maria Garcia | `maria.garcia` | `password123` |

---

## 📅 Sample Meetings

15 meetings created with random dates over the last 30 days:

| # | Meeting Code | Host | Date |
|---|--------------|------|------|
| 1 | IWVNTAK3 | sarah.williams | Feb 23, 2026 |
| 2 | KQDHWAIJ | lisa.anderson | Feb 20, 2026 |
| 3 | JW2VP5QJ | maria.garcia | Feb 6, 2026 |
| 4 | PO7013PL | david.brown | Feb 16, 2026 |
| 5 | 2SLMRMQL | maria.garcia | Feb 10, 2026 |
| ... | ... | ... | ... |
| *And 10 more meetings* |

---

## 🚀 How to Use Sample Data

### Login with Any User

1. Open http://localhost:3000
2. Click "Login"
3. Use any username from the table above
4. Password: `password123`
5. Start using the app!

### Quick Test Accounts

**For quick testing, use these:**
- Username: `john.doe` | Password: `password123`
- Username: `jane.smith` | Password: `password123`
- Username: `mike.johnson` | Password: `password123`

---

## 🔄 Re-seed Database

If you want to reset the database with fresh sample data:

```bash
cd backend
node seed-data.js
```

This will:
- Clear all existing users and meetings
- Create 10 new sample users
- Create 15 new sample meetings
- Display all credentials

---

## 📊 Database Statistics

**Current Data:**
- Total Users: 10
- Total Meetings: 15
- Database: Local MongoDB (localhost:27017/connectnow)

**Verified:** ✅ Database connection working  
**API Test:** http://localhost:8000/api/test-db

---

## 🎯 What You Can Test Now

### User Features
- ✅ Login with any sample user
- ✅ View user profile
- ✅ Create new meetings
- ✅ Join existing meetings
- ✅ View meeting history

### Meeting Features
- ✅ Video conferencing
- ✅ Audio controls
- ✅ Real-time chat
- ✅ Screen sharing
- ✅ Participant management

---

## 💡 Tips

### Testing Multiple Users
1. Open http://localhost:3000 in regular browser
2. Login as `john.doe`
3. Open http://localhost:3000 in incognito/private window
4. Login as `jane.smith`
5. Create a meeting with one user
6. Join with the other user
7. Test video conferencing!

### Creating More Data
- Login and create new meetings
- Register new users
- All data persists while backend is running

### Viewing Data
- Users: Check login functionality
- Meetings: Check meeting history page
- API: http://localhost:8000/api/test-db

---

## 🎉 Your Database is Ready!

You now have a fully populated database with:
- 10 users ready to login
- 15 meetings with history
- All features ready to test

**Start testing your ConnectNow app now!** 🚀

Open http://localhost:3000 and login with any user above.

---

## 📝 Notes

- All passwords are hashed securely with bcrypt
- Meeting codes are randomly generated
- Dates are distributed over the last 30 days
- Data is stored in local MongoDB
- Data persists while backend server is running
- To make data permanent, deploy to Render with MongoDB Atlas

---

**Need to add more data?** Just run `node seed-data.js` again!
