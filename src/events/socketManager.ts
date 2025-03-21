import { ExtendedError, Socket, Server as SocketIOServer } from "socket.io";
import RoomHandler from "@/features/rooms/controllers/roomController.ts";
import ChatHandler from "./handlers/chatHandler.ts";
import getUserFromToken from "@/features/authentication/helpers/getUserFromToken.ts";
import AppError from "@/common/classes/AppError.ts";

export default class SocketManager {
  private io: SocketIOServer;
  private roomHandler: RoomHandler;
  private chatHandler: ChatHandler;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.roomHandler = new RoomHandler(this.io);
    this.chatHandler = new ChatHandler();

    this.initialize();
  }

  static async protect(socket: Socket, next: (err?: ExtendedError) => void) {
    const bearerToken = socket.handshake.auth.token;

    if (!bearerToken) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    let token: string;
    if (
      bearerToken &&
      bearerToken.startsWith('Bearer')
    ) {
      token = bearerToken.split(' ')[1];
    }
    const { currentUser } = await getUserFromToken(token);
    
    // inject user to socket
    socket.data.user = currentUser;

    next();
  }

  private initialize(): void {
    this.io.on("connection", (socket: Socket) => {

      // Initialize handlers for this socket
      this.roomHandler.handleConnection(socket);
      this.chatHandler.handleConnection(socket);

      socket.on('disconnect', () => {
        RoomHandler.leaveRoomHandler(socket)
      });
    });
  }
}