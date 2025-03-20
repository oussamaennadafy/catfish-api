import { Socket, Server as SocketIOServer } from "socket.io";
import RoomHandler from "@/features/rooms/controllers/roomController.ts";
import ChatHandler from "./handlers/chatHandler.ts";

export default class SocketManager {
  private io: SocketIOServer;
  private roomHandler: RoomHandler;
  private chatHandler: ChatHandler;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.roomHandler = new RoomHandler(this.io);
    this.chatHandler = new ChatHandler(this.io);
    
    this.initialize();
  }

  private initialize(): void {
    this.io.on("connection", (socket: Socket) => {
      // console.log(`New connection: ${socket.id}`);
      
      // Initialize handlers for this socket
      this.roomHandler.handleConnection(socket);
      this.chatHandler.handleConnection(socket);
      
      socket.on('disconnect', () => {
        // console.log(`Disconnected: ${socket.id}`);
      });
    });
  }
}