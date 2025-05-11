import { Socket, Server as SocketIOServer } from "socket.io";
import RoomHandler from "@/features/rooms/controllers/roomController.ts";
import ChatHandler from "./handlers/chatHandler.ts";

export default class SocketManager {
  private ioServer: SocketIOServer;
  private roomHandler: RoomHandler;
  private chatHandler: ChatHandler;

  constructor(io: SocketIOServer) {
    this.ioServer = io;
    this.roomHandler = new RoomHandler(this.ioServer);
    this.chatHandler = new ChatHandler();

    this.initialize();
  }

  private initialize(): void {
    this.ioServer.on("connection", (socket: Socket) => {

      // Initialize handlers for this socket
      this.roomHandler.handleConnection(socket);
      this.chatHandler.handleConnection(socket);

      socket.on('disconnect', (socket) => {
        console.log(socket);
        // RoomHandler.leaveRoomHandler(socket);
      });
    });
  }
}