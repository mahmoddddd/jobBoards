const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://job-boards-front.vercel.app', process.env.FRONTEND_URL].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Send notification to specific user
 */
const sendToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

/**
 * Send notification to all connected users
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, sendToUser, broadcast, getIO };
