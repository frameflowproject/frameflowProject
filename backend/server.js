const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// IMMEDIATE Debug - This should show up first
console.log("DOTENV DEBUG - Environment Variables Check:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "EXISTS" : "MISSING"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING"
);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "EXISTS" : "MISSING"
);
console.log(
  "BREVO_API_KEY:",
  process.env.BREVO_API_KEY ? "EXISTS" : "MISSING"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING"
);
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING"
);

const { testConnection } = require("./config/cloudinary");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://frameflowproject.onrender.com",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (for uploaded images)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts")); // Re-enabled for user posts
app.use("/api/users", require("./routes/users"));
app.use("/api/media", require("./routes/media")); // New media upload routes
app.use("/api/content", require("./routes/content")); // Content management routes
app.use("/api/messages", require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/ai", require("./routes/ai")); // AI Chatbot route

// MongoDB Connection with improved error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    console.log(`Database: ${mongoose.connection.name}`);
    // Test Cloudinary connection
    testConnection();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// MongoDB connection event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  try {
    // 1. Close HTTP server first to stop accepting new requests
    server.close(async () => {
      console.log('HTTP server closed.');

      // 2. Close MongoDB connection
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Force close if it takes too long
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);

  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle nodemon restart signal
process.on('SIGUSR2', async () => {
  console.log('Nodemon restart detected (SIGUSR2)');
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

// Request Logger
app.use((req, res, next) => {
  if (req.url.includes('messages')) {
    console.error(`>>>> [MSG REQ] ${req.method} ${req.url}`);
  } else {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FrameFlow API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

// API Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      process.env.FRONTEND_URL, // Allow Vercel frontend
    ].filter(Boolean), // Remove undefined values
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io accessible in routes
app.set("io", io);

// Store online users
const onlineUsers = new Map();

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with their ID
  socket.on("join", (userId) => {
    if (!userId) {
      console.error("No userId provided for join");
      return;
    }

    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    // Broadcast user online status
    socket.broadcast.emit("user_online", userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);

    // Send current online users to the newly joined user
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit("online_users_list", onlineIds);
  });

  // Handle request for online users list
  socket.on("get_online_users", () => {
    const onlineIds = Array.from(onlineUsers.keys());
    console.log("Sending online users list:", onlineIds); // DEBUG LOG
    socket.emit("online_users_list", onlineIds);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      console.log("Message received:", data);

      // Validate required fields
      if (!data.senderId || !data.recipientId || !data.text) {
        throw new Error("Missing required message fields");
      }

      // Save message to database
      const Message = require("./models/Message");
      const User = require("./models/User");

      // Get sender and recipient info
      const sender = await User.findById(data.senderId);
      const recipient = await User.findById(data.recipientId);

      if (!sender || !recipient) {
        throw new Error("Sender or recipient not found");
      }

      // Create message in database
      const newMessage = new Message({
        senderId: data.senderId,
        recipientId: data.recipientId,
        conversationId: data.conversationId,
        text: data.text,
        messageType: data.messageType || "text",
        replyTo: data.replyToId || null // Add replyTo
      });

      let savedMessage = await newMessage.save();
      console.log("Message saved to database:", savedMessage._id);

      // Populate replyTo details if exists for better UI on receipt
      if (savedMessage.replyTo) {
        savedMessage = await Message.findById(savedMessage._id).populate({
          path: 'replyTo',
          select: 'text messageType senderId',
          populate: { path: 'senderId', select: 'fullName username' }
        });
      }

      // Prepare message data with sender info
      const messageWithSenderInfo = {
        ...data,
        id: savedMessage._id.toString(),
        timestamp: savedMessage.createdAt.toISOString(),
        status: "delivered",
        senderFullName: sender.fullName,
        senderUsername: sender.username,
        senderAvatar: sender.avatar,
        replyTo: savedMessage.replyTo ? {
          id: savedMessage.replyTo._id,
          text: savedMessage.replyTo.text,
          senderFullName: savedMessage.replyTo.senderId?.fullName,
          senderUsername: savedMessage.replyTo.senderId?.username
        } : null,
        isEdited: !!savedMessage.isEdited
      };

      // Emit to recipient if online - INSTANT DELIVERY
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        console.log(`🚀 INSTANTLY DELIVERING MESSAGE to ${data.recipientId} via socket ${recipientSocketId}`);
        console.log(`📤 Message content:`, messageWithSenderInfo.text);

        io.to(recipientSocketId).emit("receive_message", messageWithSenderInfo);

        // Also emit to all sockets of recipient (in case multiple tabs)
        io.to(data.recipientId).emit("receive_message", messageWithSenderInfo);

        console.log(`✅ Message delivered instantly!`);
      } else {
        console.log(`❌ Recipient ${data.recipientId} is offline - message saved but not delivered`);
      }

      // Confirm message sent to sender
      socket.emit("message_sent", {
        tempId: data.tempId,
        messageId: savedMessage._id.toString(),
        status: "sent",
        timestamp: savedMessage.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", {
        tempId: data.tempId,
        error: "Failed to send message: " + error.message,
      });
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId: socket.userId,
        isTyping: true,
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId: socket.userId,
        isTyping: false,
      });
    }
  });

  // Handle message read status
  socket.on("message_read", (data) => {
    const senderSocketId = onlineUsers.get(data.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message_read_confirmation", {
        messageId: data.messageId,
        readBy: socket.userId,
        readAt: new Date().toISOString(),
      });
    }
  });

  // WebRTC Signaling Events
  socket.on("call-user", (data) => {
    const recipientSocketId = onlineUsers.get(data.userToCall);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("call-made", {
        offer: data.offer,
        socket: socket.id,
        userCalling: socket.userId,
        callType: data.callType
      });
    }
  });

  socket.on("answer-call", (data) => {
    io.to(data.to).emit("call-answered", {
      answer: data.answer,
      socket: socket.id
    });
  });

  socket.on("ice-candidate", (data) => {
    let targetSocketId = data.to;
    if (!targetSocketId && data.targetUserId) {
      targetSocketId = onlineUsers.get(data.targetUserId);
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id
      });
    } else {
      console.log("ICE Candidate could not be delivered: Target not found", data.targetUserId);
    }
  });

  socket.on("end-call", (data) => {
    const recipientSocketId = onlineUsers.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("call-ended", { from: socket.userId });
    } else if (data.socketId) {
      io.to(data.socketId).emit("call-ended", { from: socket.userId });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);

    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit("user_offline", socket.userId);
      console.log(`User ${socket.userId} went offline`);
    }
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 5000;

// Cleanup expired stories every hour
const { cloudinary } = require("./config/cloudinary");
const Story = require("./models/Story");

setInterval(async () => {
  try {
    const expiredStories = await Story.find({
      expiresAt: { $lt: new Date() },
      isActive: true,
    });

    console.log(`Cleaning up ${expiredStories.length} expired stories...`);

    // Delete from Cloudinary and mark as inactive
    for (const story of expiredStories) {
      try {
        await cloudinary.uploader.destroy(story.media.public_id, {
          resource_type: story.media.resource_type,
        });
        story.isActive = false;
        await story.save();
      } catch (error) {
        console.error(`Failed to cleanup story ${story._id}:`, error.message);
      }
    }

    if (expiredStories.length > 0) {
      console.log(`Cleaned up ${expiredStories.length} expired stories`);
    }
  } catch (error) {
    console.error("Story cleanup error:", error);
  }
}, 60 * 60 * 1000); // Every hour

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Cloudinary integration enabled`);
  console.log(`Story cleanup job running every hour`);
});
