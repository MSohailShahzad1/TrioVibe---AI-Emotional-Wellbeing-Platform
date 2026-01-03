
// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { ConnectDB } from "./lib/db.js";
import { setupSocketHandlers } from "./lib/sockethandler.js";

import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import emotionRouter from "./routes/emotionRoutes.js";
import therapyRouter from "./routes/therapysessionRoutes.js";

import authRouter from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import roomRouter from "./routes/roomRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import therapistRouter from "./routes/therapistRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Connect MongoDB
ConnectDB();

// ✅ WebRTC Signaling Maps
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// ✅ Setup Socket Handlers (your existing handlers)
setupSocketHandlers(io);

// ✅ WebRTC Signaling Handlers
io.on("connection", (socket) => {
  console.log(`Socket Connected for WebRTC`, socket.id);
  
  // Room join for video calls
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    
    // Notify others in the room that a user joined
    io.to(room).emit("user:joined", { email, id: socket.id });
    
    // Join the room
    socket.join(room);
    
    // Confirm to the joining user
    io.to(socket.id).emit("room:join", data);
    
    console.log(`User ${email} joined room ${room}`);
  });

  // Initiate a call
  socket.on("user:call", ({ to, offer }) => {
    console.log(`Call initiated from ${socket.id} to ${to}`);
    io.to(to).emit("incoming:call", { 
      from: socket.id, 
      offer,
      callerEmail: socketidToEmailMap.get(socket.id)
    });
  });

  // Accept a call
  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`Call accepted by ${socket.id} for ${to}`);
    io.to(to).emit("call:accepted", { 
      from: socket.id, 
      ans,
      answererEmail: socketidToEmailMap.get(socket.id)
    });
  });

  // WebRTC negotiation needed
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed from", socket.id, "to", to);
    io.to(to).emit("peer:nego:needed", { 
      from: socket.id, 
      offer 
    });
  });

  // WebRTC negotiation done
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done from", socket.id, "to", to);
    io.to(to).emit("peer:nego:final", { 
      from: socket.id, 
      ans 
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`Socket Disconnected`, socket.id);
    
    // Clean up mappings
    const email = socketidToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketidToEmailMap.delete(socket.id);
      console.log(`Cleaned up mappings for ${email}`);
    }
  });

  // Optional: Get user by email
  socket.on("get:socket:id", (email, callback) => {
    const socketId = emailToSocketIdMap.get(email);
    if (callback) {
      callback(socketId);
    }
  });

  // Optional: Leave room
  socket.on("room:leave", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
    
    // Notify others in the room
    socket.to(room).emit("user:left", { 
      id: socket.id,
      email: socketidToEmailMap.get(socket.id)
    });
  });
});

// ✅ Global Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/emotion", emotionRouter);
app.use("/api/therapy", therapyRouter);
app.use("/api/room", roomRouter);
app.use("/api/admin", adminRouter);
app.use("/api/therapist",therapistRouter);
app.use("/api/appointment",appointmentRouter)


// ✅ Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ API Summary Endpoint (Optional Debug)
app.get("/api/test-routes", (req, res) => {
  res.json({
    success: true,
    message: "All routes working ✅",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      chat: "/api/chat/*",
      emotion: "/api/emotion/*",
      user: "/api/user/*",
      videoCall: "/api/video-call/*",
      therapy: "/api/therapy/*",
    },
  });
});

// ✅ Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS allowed origin: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📦 Connected routes: /api/auth, /api/chat, /api/video-call, /api/therapy`);
  console.log(`⚡ Socket.IO ready for both chat and WebRTC`);
});