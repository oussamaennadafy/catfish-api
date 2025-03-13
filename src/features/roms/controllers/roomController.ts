import { RoomModel } from "../models/room.ts";
import { RoomType } from "../types/roomTypes.ts";
import { isRoomFull } from "../utils/isRoomFull.ts";

export default class RoomController {
  static findOrCreateRoom = async (roomType: RoomType) => {
    const wherecondition: {
      isFull: boolean,
      roomType: null | RoomType
    } = {
      isFull: false,
      roomType: null
    };

    // add the roomType condtion only if not shuffle type
    if (roomType !== RoomType.shuffle) wherecondition.roomType = roomType;

    const room = await RoomModel.findOne({ where: wherecondition });

    if (room == null) {
      // create new room type handle shuffle type
      const newRoomType: RoomType = roomType !== RoomType.shuffle ? roomType : RoomType.twoUsers;
      // create new room
      const newRoom = RoomModel.create({ roomType: newRoomType.toString(), membersCount: 1, isFull: false });
      return newRoom;
    } else {
      // joins existing room
      room.membersCount++;
      // calculate if room is full or still
      room.isFull = isRoomFull({ roomType: RoomType[room.roomType], membersCount: room.membersCount });
      room.save();
      return room;
    }
  }

  static updateRoom = async (roomId: number) => {
    const room = await RoomModel.findOne({ where: { id: roomId } });
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