import { Socket, Server as SocketIOServer } from "socket.io";
import { waitingQueueModel } from "@/features/rooms/models/waitingQueueModel.ts";
import { RoomEvents } from "@/features/rooms/constants/events.ts";
import { eq } from "drizzle-orm";
import { roomModel } from "@/features/rooms/models/roomModel.ts";
import { RoomTypeEnum } from "@/features/rooms/types/roomTypes.ts";
import { db } from "@/config/database.ts";

export default class RoomHandler {
  private io: SocketIOServer;
  private joinedRoomId: number;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  public handleConnection(socket: Socket): void {
    // Listen if a user joins a room
    socket.on(RoomEvents.client.JOIN_ROOM, async (roomType: string) => this.joinRoomHandler(socket, roomType));

    // when users leave room
    socket.on(RoomEvents.client.LEAVE_ROOM, async () => this.leaveRoomHandler(socket));
  }

  /**
   * 
   * @description this function handle all logic of join room event
   * @param socket 
   * @param roomType
   * @returns void
   */
  private async joinRoomHandler(socket: Socket, roomType: string) {
    // guard clause for auth
    if(!socket.handshake.auth.token) return;

    // check if some users are waiting
    const waitingUser = (await db.select().from(waitingQueueModel).where(eq(waitingQueueModel.roomType, roomType))).at(0);
    // if no matching found let bo wait
    if (!waitingUser) {
      // let bro have a seat in the database
      await db.insert(waitingQueueModel).values({
        socketId: socket.id,
        roomType: roomType,
      });
      return;
    }

    // if we found user
    if (waitingUser) {
      // remove user from waiting room
      await db.delete(waitingQueueModel).where(eq(waitingQueueModel.id, waitingUser.id));
      // create a room
      const insertedRoom = await db.insert(roomModel).values({
        type: RoomTypeEnum[roomType],
      }).returning();
      const insertedRoomId: number = insertedRoom.at(0).id;
      // emit event to users that a user is connected
      const waitingUserSocket = this.io.sockets.sockets.get(waitingUser.socketId);
      // update room membersCount
      await db.update(roomModel).set({ [roomModel.membersCount.name]: 2 }).where(eq(roomModel.id, insertedRoomId));
      // join both users to same room
      waitingUserSocket.join(insertedRoomId.toString());
      socket.join(insertedRoomId.toString());
      // save room id
      this.joinedRoomId = insertedRoomId;

      // notify both users that a user is joined
      waitingUserSocket.emit(RoomEvents.server.USER_JOINED, "some one come, sorry for waiting...")
      socket.emit(RoomEvents.server.USER_JOINED, "someone was waiting for youu bro...");
    }
  }

  /**
   * 
   * @description this function hanlde all logic of leave room event
   * @param socket 
   * @returns void
   */
  private async leaveRoomHandler(socket: Socket) {
    // get the room row
    // const room = (await db.select().from(roomModel).where(eq(roomModel.id, this.joinedRoomId))).at(0);

    // // if room will have only one sad bro delete it 
    // if (room.membersCount > 2) {

    // }
    // // disconnect from room socket
    // socket.leave(this.joinedRoomId.toString());
    // console.log(room.membersCount);
  }

}