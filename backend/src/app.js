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
        const connectionDb = await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://imdigitalashish:imdigitalashish@cluster0.cujabk4.mongodb.net/")
        
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`)
        
        // Check if users collection exists and has data
        const User = (await import('./models/user.model.js')).User;
        const userCount = await User.countDocuments();
        console.log(`Total users in database: ${userCount}`);
        
        server.listen(app.get("port"), () => {
            console.log("LISTENING ON PORT 8000")
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();