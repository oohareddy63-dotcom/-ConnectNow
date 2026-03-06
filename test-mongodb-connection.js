import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Connection string (password hidden):');
        console.log(process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('\n✅ SUCCESS! MongoDB Connected');
        console.log('Host:', connection.connection.host);
        console.log('Database:', connection.connection.name);
        console.log('Connection State:', connection.connection.readyState);
        
        await mongoose.connection.close();
        console.log('\n✅ Connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED');
        console.error('Error:', error.message);
        
        if (error.message.includes('bad auth')) {
            console.error('\n💡 Tip: Check your password in the .env file');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Tip: Check your cluster URL and internet connection');
        }
        
        process.exit(1);
    }
};

testConnection();
