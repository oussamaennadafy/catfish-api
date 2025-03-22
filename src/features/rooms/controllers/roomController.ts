import { Socket, Server as SocketIOServer } from "socket.io";
import { waitingQueueModel } from "@/features/rooms/models/waitingQueueModel.ts";
import { RoomEvents } from "@/features/rooms/constants/events.ts";
import { eq, or } from "drizzle-orm";
import { roomModel } from "@/features/rooms/models/roomModel.ts";
import { RoomTypeEnum } from "@/features/rooms/types/roomTypes.ts";
import { db } from "@/config/database.ts";
import { User, users } from "@/features/authentication/models/userModel.ts";

export default class RoomHandler {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  public async handleConnection(socket: Socket) {
    if(!socket.data.user) {
      console.log("we dont have user token");
      return;
    }
    // update users socket
    await db.update(users).set({
      socketId: socket.id,
    } as unknown).where(eq(users.id, socket.data.user.id))

    // Listen if a user joins a room
    socket.on(RoomEvents.client.JOIN_ROOM, async (roomType: string) => this.joinRoomHandler(socket, roomType));

    // when users leave room
    socket.on(RoomEvents.client.LEAVE_ROOM, async () => RoomHandler.leaveRoomHandler(socket));
  }

  /**
   * 
   * @description this function handle all logic of join room event
   * @param socket 
   * @param roomType
   * @returns void
   */
  private async joinRoomHandler(socket: Socket, roomType: string) {
    const currentUser: User = socket.data.user;

    // check if some users are waiting
    const waitingUser = (await db.select().from(waitingQueueModel).where(eq(waitingQueueModel.roomType, roomType))).at(0);

    // if no matching found let bro wait
    if (!waitingUser) {
      // let bro have a seat in the database
      await db.insert(waitingQueueModel).values({
        socketId: socket.id,
        roomType: roomType,
        userId: currentUser.id,
      });
      return;
    }

    // if we found user
    if (waitingUser) {
      // remove user from waiting room
      await db.delete(waitingQueueModel).where(eq(waitingQueueModel.id, waitingUser.id));

      // emit event to users that a user is connected
      const waitingUserSocket = this.io.sockets.sockets.get(waitingUser.socketId);
      if (!waitingUserSocket) return;

      // create a room
      const insertedRoom = await db.insert(roomModel).values({
        type: RoomTypeEnum[roomType],
      }).returning();
      const insertedRoomId: number = insertedRoom.at(0).id;

      // join both users to same room
      waitingUserSocket.join(insertedRoomId.toString());
      socket.join(insertedRoomId.toString());

      // update users in db with new joined room
      await db.update(users).set({
        joinedRoom: insertedRoomId,
      } as unknown).where(or(
        eq(users.id, currentUser.id),
        eq(users.id, waitingUser.userId),
      ));

      // notify both users that a user is joined
      waitingUserSocket.emit(RoomEvents.server.USER_JOINED, socket.data.user.id);
    }
  }

  /**
   * 
   * @description this function hanlde all logic of leave room event
   * @param socket 
   * @returns void
   */
  static async leaveRoomHandler(socket: Socket) {
    // get current user
    const currentUser: User = (await db.select().from(users).where(eq(users.id, socket.data.user.id))).at(0);

    // get the room
    const room = (await db.select().from(roomModel).where(eq(roomModel.id, currentUser.joinedRoom))).at(0);

    // if room will have only one sad bro delete it
    if (room?.membersCount <= 2) {
      const usersInRoom = await db.select().from(users).where(eq(users.joinedRoom, room.id));

      // make last one in waiting queue
      const lastUserInRoom = usersInRoom.filter(user => user.id !== socket.data.user.id).at(0);

      await db.insert(waitingQueueModel).values({
        socketId: lastUserInRoom.socketId,
        roomType: room.type,
        userId: lastUserInRoom.id,
      });

      // update joinedRoom users in room
      for (let i = 0; i < usersInRoom.length; i++) {
        await db.update(users).set({
          joinedRoom: null,
        } as unknown).where(eq(users.id, usersInRoom[i].id));
      }

      // delete room
      await db.delete(roomModel).where(eq(roomModel.id, room.id));

      // remove user from waiting
      await db.delete(waitingQueueModel).where(eq(waitingQueueModel.userId, socket.data.user.id));
    }
    // disconnect from room socket
    socket.leave(room?.id?.toString());
  }

}