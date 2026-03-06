import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String }
});

const meetingSchema = new mongoose.Schema({
    user_id: { type: String },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true }
});

const User = mongoose.model('User', userSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);

// Sample data
const sampleUsers = [
    { name: 'John Doe', username: 'john.doe', password: 'password123' },
    { name: 'Jane Smith', username: 'jane.smith', password: 'password123' },
    { name: 'Mike Johnson', username: 'mike.johnson', password: 'password123' },
    { name: 'Sarah Williams', username: 'sarah.williams', password: 'password123' },
    { name: 'David Brown', username: 'david.brown', password: 'password123' },
    { name: 'Emily Davis', username: 'emily.davis', password: 'password123' },
    { name: 'Robert Miller', username: 'robert.miller', password: 'password123' },
    { name: 'Lisa Anderson', username: 'lisa.anderson', password: 'password123' },
    { name: 'James Wilson', username: 'james.wilson', password: 'password123' },
    { name: 'Maria Garcia', username: 'maria.garcia', password: 'password123' }
];

const generateMeetingCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        
        // Try MongoDB Atlas first, fallback to local
        let mongoUri = process.env.MONGO_URI;
        const mongoOptions = {
            serverSelectionTimeoutMS: 10000,
            family: 4
        };

        try {
            await mongoose.connect(mongoUri, mongoOptions);
            console.log('✅ Connected to MongoDB Atlas');
        } catch (atlasError) {
            console.log('⚠️  MongoDB Atlas failed, using local MongoDB...');
            const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/connectnow';
            await mongoose.connect(localUri, mongoOptions);
            console.log('✅ Connected to Local MongoDB');
        }

        // Clear existing data
        console.log('\n🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Meeting.deleteMany({});
        console.log('✅ Existing data cleared');

        // Hash passwords and create users
        console.log('\n👥 Creating sample users...');
        const hashedUsers = await Promise.all(
            sampleUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        const createdUsers = await User.insertMany(hashedUsers);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Create sample meetings
        console.log('\n📅 Creating sample meetings...');
        const sampleMeetings = [];
        
        // Create 15 meetings with different dates
        for (let i = 0; i < 15; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
            const meetingDate = new Date();
            meetingDate.setDate(meetingDate.getDate() - daysAgo);
            
            sampleMeetings.push({
                user_id: randomUser._id.toString(),
                meetingCode: generateMeetingCode(),
                date: meetingDate
            });
        }

        const createdMeetings = await Meeting.insertMany(sampleMeetings);
        console.log(`✅ Created ${createdMeetings.length} meetings`);

        // Display summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   Users: ${createdUsers.length}`);
        console.log(`   Meetings: ${createdMeetings.length}`);
        
        console.log('\n👥 Sample Users (username / password):');
        sampleUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} / ${user.password}`);
        });

        console.log('\n📅 Sample Meetings:');
        createdMeetings.slice(0, 5).forEach((meeting, index) => {
            const user = createdUsers.find(u => u._id.toString() === meeting.user_id);
            console.log(`   ${index + 1}. Code: ${meeting.meetingCode} | Host: ${user?.username} | Date: ${meeting.date.toLocaleDateString()}`);
        });
        console.log(`   ... and ${createdMeetings.length - 5} more meetings`);

        console.log('\n✅ You can now login with any of the above credentials!');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
