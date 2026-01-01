import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import matchRoutes from "./match.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";
import creditRoutes from "./routes/credits.js";
import chatRoutes from "./routes/chat.js";
import communityRoutes from "./routes/community.js";
import uploadRoutes from "./routes/upload.js";

import Message from "./Message.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/match", matchRoutes);
app.use("/credits", creditRoutes);
app.use("/chat", chatRoutes);
app.use("/community", communityRoutes);
app.use("/upload", uploadRoutes);


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for MVP
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (userId) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
    });

    socket.on("send_message", async (data) => {
        const { sender, recipient, content, fileUrl, fileType } = data;

        // Save to DB
        try {
            // Fallback content to satisfy validation if needed, though schema is optional now
            const finalContent = content || (fileUrl ? "File Attachment" : "Message");
            const savedMessage = await Message.create({ sender, recipient, content: finalContent, fileUrl, fileType });

            // Emit to recipient's room
            io.to(recipient).emit("receive_message", savedMessage);
            // Also emit back to sender (or handle optimistically on frontend)
            io.to(sender).emit("receive_message", savedMessage);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(5000, () => console.log("Backend running on port 5000"));
