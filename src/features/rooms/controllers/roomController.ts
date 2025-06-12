import { Socket, Server as SocketIOServer } from "socket.io";
import { RoomEvents } from "@/features/rooms/constants/events.ts";
import { db } from "@/config/database.ts";
import { eq } from "drizzle-orm";
import { roomModel } from "../models/roomModel.ts";

export default class RoomHandler {
  constructor(io: SocketIOServer) {
    this.io = io;
  }

  io: SocketIOServer;

  public async handleConnection(socket: Socket) {
    // when users join room
    socket.on(RoomEvents.client.JOIN_ROOM, async (userId: string) => this.joinRoomHandler(socket, userId));

    // when users leave room
    socket.on(RoomEvents.client.LEAVE_ROOM, async () => RoomHandler.leaveRoomHandler(socket));

    // when user toggle camera
    socket.on(RoomEvents.client.TOGGLE_CAMERA, async (userId: string, alsoEmitToMe: boolean) => this.ToogleCameraHandler(socket, userId, alsoEmitToMe));

    // when user toggle mic
    socket.on(RoomEvents.client.TOGGLE_MIC, async (userId: string, alsoEmitToMe: boolean) => this.ToogleMicHandler(socket, userId, alsoEmitToMe));

    // when user toggle mic
    socket.on(RoomEvents.client.STREAM_STARTED, async () => this.StreamStartedHandler(socket));
  }

  /**
   * @description this function handle all logic of join room event
   * @param socket 
   * @param userId
   * @returns Promise<void>
   */
  private async joinRoomHandler(socket: Socket, userId: string) {
    const availableRooms = await db.select().from(roomModel).where(eq(roomModel.isFull, false));
    if (availableRooms.length === 0) {
      // create new room
      const createdRoom = await db.insert(roomModel).values({
        isFull: false,
      }).returning();
      // if the room is not created
      if (createdRoom.length === 0) return;
      const roomID = createdRoom.at(0).id.toString();
      // join room
      await socket.join(roomID);
      socket.data["roomID"] = roomID;
    } else {
      const availableRoomId = availableRooms.at(0).id.toString();
      // make the rooms marked as full
      await db.update(roomModel).set({
        isFull: true,
        membersCount: 2,
      }).where(eq(roomModel.id, Number(availableRoomId)));
      await socket.join(availableRoomId);
      socket.data["roomID"] = availableRoomId;
      socket.to(availableRoomId).emit(RoomEvents.server.USER_JOINED, userId);
    }
  }

  /**
   * @description this function hanlde all logic of leave room event
   * @param socket
   * @returns Promise<void>
  */
  static async leaveRoomHandler(socket: Socket) {
    const rooms = await db.select().from(roomModel).where(eq(roomModel.id, socket.data["roomID"]));
    if (rooms.length === 0) return;
    const room = rooms.at(0);
    if (room.membersCount === 2) {
      await db.update(roomModel).set({
        isFull: false,
        membersCount: 1,
      }).where(eq(roomModel.id, room.id));
    } else if (room.membersCount === 1) {
      await db.delete(roomModel).where(eq(roomModel.id, room.id));
    }
    await socket.leave(room.id.toString());
    socket.emit(RoomEvents.server.READY_TO_JOIN);
  }

  /**
   * @description this function hanlde all logic of toggle camera room event
   * @param socket
   * @param userId
   * @param alsoEmitToMe
   * @returns Promise<void>
  */
  private async ToogleCameraHandler(socket: Socket, userId: string, alsoEmitToMe = true) {
    const roomID = socket.data["roomID"];
    socket.to(roomID).emit(RoomEvents.server.CAMERA_TOGGLED, userId);
    if (alsoEmitToMe) {
      socket.emit(RoomEvents.server.CAMERA_TOGGLED, userId);
    }
  }


  /**
   * @description this function hanlde all logic of toggle camera room event
   * @param socket
   * @param userId
   * @param alsoEmitToMe
   * @returns Promise<void>
  */
  private async ToogleMicHandler(socket: Socket, userId: string, alsoEmitToMe = true) {
    const roomID = socket.data["roomID"];
    socket.to(roomID).emit(RoomEvents.server.MIC_TOGGLED, userId);
    if (alsoEmitToMe) {
      socket.emit(RoomEvents.server.MIC_TOGGLED, userId);
    }
  }


  /**
   * @description this function hanlde all logic of stream started room event
   * @param socket
   * @returns Promise<void>
  */
  private async StreamStartedHandler(socket: Socket) {
    const roomID = socket.data["roomID"];
    socket.to(roomID).emit(RoomEvents.server.STREAM_STARTED);
  }

}