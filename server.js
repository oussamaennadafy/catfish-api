import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import 'dotenv/config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.use(cors())

app.get('/', (req, res) => {
  res.json({ data: "server running..." })
})

io.on('connection', socket => {
  // listen if a user joins a room
  socket.on('join-room', (roomId, userId, roomType) => {
    // console.log(`evet Emmited -> join-room | user -> ${userId} |  roomType -> ${roomType}`);
    // make the user joins the room
    socket.join(roomId)
    // wait fo the user to be ready
    socket.on('ready', () => {
      // notify all connected users to the specific room that a user is joined
      socket.to(roomId).emit('user-connected', userId);
    })

    // listen in the user socket disconnect
    socket.on('disconnect', () => {
      // notify all the  users to the specific room that a user is leaves
      socket.to(roomId).emit('user-disconnected', userId);
    })
  })
})

httpServer.listen(process.env.PORT);