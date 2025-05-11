import { Socket, Server as SocketIOServer } from "socket.io";
import { RoomEvents } from "@/features/rooms/constants/events.ts";

export default class RoomHandler {
  constructor(io: SocketIOServer) {
  }

  public async handleConnection(socket: Socket) {
    // Listen if a user joins a room
    socket.on(RoomEvents.client.JOIN_ROOM, async (roomType: string, userId: string) => this.joinRoomHandler(socket, roomType, userId));

    // when users leave room
    socket.on(RoomEvents.client.LEAVE_ROOM, async (userId: string) => RoomHandler.leaveRoomHandler(socket, userId));
  }

  /**
   * 
   * @description this function handle all logic of join room event
   * @param socket 
   * @param roomType
   * @returns void
   */
  private async joinRoomHandler(socket: Socket, roomType: string, userId: string) {
    console.log({socket: socket.id, roomType, userId});
  }
  
  /**
   * 
   * @description this function hanlde all logic of leave room event
   * @param socket 
   * @returns void
  */
 static async leaveRoomHandler(socket: Socket, userId: string) {
    console.log({socket, userId});
  }

}