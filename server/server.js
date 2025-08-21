const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const User = require('./models/User');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// --- Real-time Logic ---
const userSocketMap = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    userSocketMap.set(userId, socket.id);

    User.findByIdAndUpdate(userId, { onlineStatus: true }, { new: true })
      .then(() => {
        socket.broadcast.emit('user:online', { userId });
      })
      .catch(err => console.error(err));
  }

  // --- ALL SOCKET LISTENERS MUST BE INSIDE HERE ---

  socket.on('messages:read', async (data) => {
    try {
      const { senderId } = data; // The user who sent the messages we are reading
      const recipientId = userId; // The current user who is reading the messages
  
      // Update all messages from the sender to this recipient to 'read'
      await Message.updateMany(
        { sender: senderId, recipient: recipientId, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );
  
      // Notify the original sender that their messages have been read
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages:read:receipt', { readerId: recipientId });
      }
    } catch (error) {
      console.error('Error updating messages to read:', error);
    }
  });


  socket.on('message:send', async (data) => {
    try {
      const { recipientId, message } = data;
      const newMessage = new Message({
        sender: userId,
        recipient: recipientId,
        content: message,
        status: 'sent', // Initial status
      });
      await newMessage.save();
  
      const recipientSocketId = userSocketMap.get(recipientId);
      if (recipientSocketId) {
        // Forward the full message object, including ID and status
        io.to(recipientSocketId).emit('message:new', newMessage);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('typing:start', (data) => {
    const { recipientId } = data;
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:started');
    }
  });

  socket.on('typing:stop', (data) => {
    const { recipientId } = data;
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:stopped');
    }
  });

  socket.on('disconnect', () => {
    if (userId) {
      console.log(`User disconnected: ${userId}`);
      userSocketMap.delete(userId);

      User.findByIdAndUpdate(userId, { onlineStatus: false }, { new: true })
        .then(() => {
          socket.broadcast.emit('user:offline', { userId });
        })
        .catch(err => console.error(err));
    }
  });
  
}); // <-- END OF io.on('connection') BLOCK

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});