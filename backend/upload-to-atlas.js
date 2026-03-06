import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define schemas
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

async function uploadToAtlas() {
    console.log('='.repeat(60));
    console.log('Upload Local Data to MongoDB Atlas');
    console.log('='.repeat(60));
    console.log();

    try {
        // Connect to local MongoDB
        console.log('📂 Connecting to Local MongoDB...');
        const localConnection = await mongoose.createConnection(
            'mongodb://localhost:27017/connectnow',
            { serverSelectionTimeoutMS: 5000 }
        ).asPromise();
        console.log('✅ Connected to Local MongoDB');

        // Get models from local connection
        const LocalUser = localConnection.model('User', userSchema);
        const LocalMeeting = localConnection.model('Meeting', meetingSchema);

        // Fetch all data from local
        console.log('\n📊 Fetching data from local database...');
        const localUsers = await LocalUser.find({});
        const localMeetings = await LocalMeeting.find({});
        console.log(`✅ Found ${localUsers.length} users`);
        console.log(`✅ Found ${localMeetings.length} meetings`);

        if (localUsers.length === 0 && localMeetings.length === 0) {
            console.log('\n⚠️  No data to upload!');
            await localConnection.close();
            process.exit(0);
        }

        // Connect to MongoDB Atlas
        console.log('\n☁️  Connecting to MongoDB Atlas...');
        const atlasConnection = await mongoose.createConnection(
            process.env.MONGO_URI,
            { 
                serverSelectionTimeoutMS: 15000,
                family: 4
            }
        ).asPromise();
        console.log('✅ Connected to MongoDB Atlas!');
        console.log(`✅ Host: ${atlasConnection.host}`);
        console.log(`✅ Database: ${atlasConnection.name}`);

        // Get models from Atlas connection
        const AtlasUser = atlasConnection.model('User', userSchema);
        const AtlasMeeting = atlasConnection.model('Meeting', meetingSchema);

        // Upload users
        if (localUsers.length > 0) {
            console.log('\n👥 Uploading users to Atlas...');
            
            // Clear existing users in Atlas
            await AtlasUser.deleteMany({});
            console.log('   Cleared existing users in Atlas');
            
            // Insert users
            const userData = localUsers.map(user => ({
                name: user.name,
                username: user.username,
                password: user.password,
                token: user.token
            }));
            
            await AtlasUser.insertMany(userData);
            console.log(`✅ Uploaded ${userData.length} users to Atlas`);
        }

        // Upload meetings
        if (localMeetings.length > 0) {
            console.log('\n📅 Uploading meetings to Atlas...');
            
            // Clear existing meetings in Atlas
            await AtlasMeeting.deleteMany({});
            console.log('   Cleared existing meetings in Atlas');
            
            // Insert meetings
            const meetingData = localMeetings.map(meeting => ({
                user_id: meeting.user_id,
                meetingCode: meeting.meetingCode,
                date: meeting.date
            }));
            
            await AtlasMeeting.insertMany(meetingData);
            console.log(`✅ Uploaded ${meetingData.length} meetings to Atlas`);
        }

        // Verify upload
        console.log('\n🔍 Verifying upload...');
        const atlasUserCount = await AtlasUser.countDocuments();
        const atlasMeetingCount = await AtlasMeeting.countDocuments();
        console.log(`✅ Atlas Users: ${atlasUserCount}`);
        console.log(`✅ Atlas Meetings: ${atlasMeetingCount}`);

        // Display sample data
        console.log('\n📊 Sample Users in Atlas:');
        const sampleUsers = await AtlasUser.find({}).limit(5);
        sampleUsers.forEach((user, i) => {
            console.log(`   ${i + 1}. ${user.username} (${user.name})`);
        });

        console.log('\n📅 Sample Meetings in Atlas:');
        const sampleMeetings = await AtlasMeeting.find({}).limit(5);
        sampleMeetings.forEach((meeting, i) => {
            console.log(`   ${i + 1}. Code: ${meeting.meetingCode} | Date: ${meeting.date.toLocaleDateString()}`);
        });

        // Close connections
        await localConnection.close();
        await atlasConnection.close();

        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCESS! Data uploaded to MongoDB Atlas!');
        console.log('='.repeat(60));
        console.log('\n✅ Next Steps:');
        console.log('   1. Check MongoDB Atlas dashboard');
        console.log('   2. You should see all users and meetings');
        console.log('   3. Restart your backend server');
        console.log('   4. Backend will now use Atlas automatically');
        console.log('\n🌐 MongoDB Atlas Dashboard:');
        console.log('   https://cloud.mongodb.com/');
        console.log();

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
            console.log('\n⚠️  DNS Issue Detected!');
            console.log('\nThe DNS problem still exists. You need to:');
            console.log('1. Change DNS to Google DNS (8.8.8.8, 8.8.4.4)');
            console.log('2. Restart your computer');
            console.log('3. Run: node test-atlas-connection.js');
            console.log('4. If successful, run this script again');
            console.log('\nOr deploy to Render to bypass this issue completely.');
            console.log('See: RENDER-DEPLOYMENT-GUIDE.md');
        }
        
        process.exit(1);
    }
}

uploadToAtlas();
