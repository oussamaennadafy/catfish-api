import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import 'dotenv/config';
import './config/database.js';
import { RoomController } from './controllers/roomController.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.use(cors())

app.get('/', (req, res) => {
  res.json({ data: "now socket has not nested listnners..." })
})

io.on('connection', socket => {
  // Track the current room the socket is in
  let currentRoomId = null;

  // listen if a user joins a room
  socket.on('join-room', async (userId, roomType, isCameraOpen) => {
    // If already in a room, leave it first
    if (currentRoomId) {
      await leaveCurrentRoom(userId);
    }
    
    const room = await RoomController.findOrCreateRoom(roomType);
    currentRoomId = room?.dataValues?.id;
    
    // make the user joins the room
    socket.join(currentRoomId);
    
    // notify all connected users to the specific room that a user is joined
    socket.to(currentRoomId).emit('user-connected', userId, isCameraOpen);
  });

  // when user disconnected from room manually
  socket.on('leave-room', async (userId) => {
    await leaveCurrentRoom(userId);
  });

  // broadcast toggle-camera to notify all users that the current user toggle his camera
  socket.on('toggle-camera', async (isCameraOpen) => {
    // Only emit if the user is in a room
    if (currentRoomId) {
      socket.to(currentRoomId).emit('toggle-camera', isCameraOpen);
    }
  });

  // Helper function to handle leaving a room
  async function leaveCurrentRoom(userId) {
    if (currentRoomId) {
      socket.leave(currentRoomId);
      await RoomController.updateRoom(currentRoomId);
      
      // Notify other users in the room that this user has left
      socket.to(currentRoomId).emit('user-disconnected', userId);
      
      // Reset the current room
      currentRoomId = null;
    }
  }

  // listen in the user socket disconnect
  socket.on('disconnect', async () => {
    if (currentRoomId) {
      await RoomController.updateRoom(currentRoomId);
    }
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});