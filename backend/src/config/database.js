import mongoose from "mongoose";

export const connectDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const mongoOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log("Connecting to MongoDB...");
        const connection = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
        
        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        console.log(`✅ Database Name: ${connection.connection.name}`);
        
        return connection;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
};

// MongoDB connection event handlers
export const setupMongooseEventHandlers = () => {
    mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
};
