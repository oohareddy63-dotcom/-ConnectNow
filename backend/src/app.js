import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManger.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

// Add a test endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend API is working!", timestamp: new Date() });
});

// Add a test endpoint to check database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const User = (await import('./models/user.model.js')).User;
        const userCount = await User.countDocuments();
        res.json({ 
            message: "Database connection is working!", 
            userCount: userCount,
            timestamp: new Date() 
        });
    } catch (error) {
        res.status(500).json({ message: "Database connection failed", error: error.message });
    }
});

const start = async () => {
    try {
        // MongoDB connection options with enhanced DNS resolution
        const mongoOptions = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4, // Use IPv4, skip trying IPv6
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        };

        let mongoUri = process.env.MONGO_URI;
        let connectionDb;
        
        console.log("🔄 Attempting to connect to MongoDB Atlas...");
        
        try {
            // Try MongoDB Atlas first
            connectionDb = await mongoose.connect(mongoUri, mongoOptions);
            console.log(`✅ SUCCESS! Connected to MongoDB Atlas`);
            console.log(`✅ Host: ${connectionDb.connection.host}`);
            console.log(`✅ Database: ${connectionDb.connection.name}`);
        } catch (atlasError) {
            console.log(`⚠️  MongoDB Atlas connection failed: ${atlasError.message}`);
            console.log(`🔄 Falling back to local MongoDB...`);
            
            // Fallback to local MongoDB
            const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/connectnow';
            try {
                connectionDb = await mongoose.connect(localUri, mongoOptions);
                console.log(`✅ Connected to Local MongoDB`);
                console.log(`✅ Host: ${connectionDb.connection.host}`);
                console.log(`✅ Database: ${connectionDb.connection.name}`);
                console.log(`💡 Note: Using local database. Data will not appear in MongoDB Atlas.`);
            } catch (localError) {
                console.error(`❌ Both MongoDB Atlas and Local MongoDB failed`);
                console.error(`💡 Atlas Error: ${atlasError.message}`);
                console.error(`💡 Local Error: ${localError.message}`);
                throw new Error('Could not connect to any MongoDB instance');
            }
        }
        
        // Check users in database
        const User = (await import('./models/user.model.js')).User;
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // Start server
        server.listen(app.get("port"), () => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🚀 Server is RUNNING on PORT ${app.get("port")}`);
            console.log(`🌐 Frontend: http://localhost:3000`);
            console.log(`🌐 Backend: http://localhost:${app.get("port")}`);
            console.log(`🌐 API Test: http://localhost:${app.get("port")}/api/test`);
            console.log(`${'='.repeat(60)}\n`);
        });
    } catch (error) {
        console.error(`\n${'='.repeat(60)}`);
        console.error(`❌ FATAL ERROR: Failed to start server`);
        console.error(`💡 Error: ${error.message}`);
        console.error(`${'='.repeat(60)}\n`);
        process.exit(1);
    }
}

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});

start();