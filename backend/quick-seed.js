import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './src/models/user.model.js';
import { Meeting } from './src/models/meeting.model.js';

dotenv.config();

const quickSeed = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Meeting.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create admin user
        const adminUser = new User({
            name: "Admin User",
            username: "admin",
            password: await bcrypt.hash("admin123", 10),
            avatar: "https://ui-avatars.com/api/?name=Admin&background=random",
            isActive: true,
            lastSeen: new Date()
        });

        await adminUser.save();
        console.log('👤 Created admin user (admin/admin123)');

        // Create sample meeting
        const sampleMeeting = new Meeting({
            user_id: "admin",
            meetingCode: "DEMO123",
            title: "Demo Meeting",
            description: "Sample meeting for testing",
            date: new Date(),
            duration: 30,
            participants: 1,
            isActive: true,
            recordingEnabled: false,
            meetingType: 'video'
        });

        await sampleMeeting.save();
        console.log('📅 Created sample meeting (DEMO123)');

        // Verify data
        const userCount = await User.countDocuments();
        const meetingCount = await Meeting.countDocuments();
        
        console.log(`\n📊 Database Summary:`);
        console.log(`👥 Users: ${userCount}`);
        console.log(`📅 Meetings: ${meetingCount}`);
        console.log(`\n🔑 Login Credentials:`);
        console.log(`Username: admin`);
        console.log(`Password: admin123`);
        console.log(`\n🎯 Meeting Code: DEMMO123`);

        console.log('\n✅ Database seeded successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

quickSeed();
