import { Room } from "../models/room.js";
import { isRoomFull } from "../utils/isRoomFull.js";

export class RoomController {
  static findOrCreateRoom = async (roomType) => {
    const wherecondition = {
      isFull: false,
    };

    // add the roomType condtion only if not shuffle type
    if (roomType !== "shuffle") wherecondition.roomType = roomType;

    const room = await Room.findOne({ where: wherecondition });

    if (room == null) {
      // create new room type handle shuffle type
      const newRoomType = roomType !== "shuffle" ? roomType : "twoUsers";
      // create new room
      const newRoom = Room.create({ roomType: newRoomType, membersCount: 1, isFull: false });
      return newRoom;
    } else {
      // joins existing room
      room.membersCount++;
      // calculate if room is full or still 
      room.isFull = isRoomFull(room.roomType, room.membersCount);
      room.save();
      return room;
    }
  }

  static updateRoom = async (roomId) => {
    const room = await Room.findOne({ where: { id: roomId } });
    if (room == null) return;

    if (room.membersCount === 1 && room.isFull === false) {
      await room.destroy();
    } else {
      room.membersCount--;
      room.isFull = false;
      room.save();
    }
  }
}