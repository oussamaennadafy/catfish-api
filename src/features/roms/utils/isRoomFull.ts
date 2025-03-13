import { RoomType } from "../types/roomTypes.ts";

type isRoomFullParams = {
  roomType: RoomType,
  membersCount: number,
}

export const isRoomFull = ({ roomType, membersCount }: isRoomFullParams) => {
  switch (roomType) {
    case RoomType.twoUsers:
      return membersCount >= 2;
    case RoomType.threeUsers:
      return membersCount >= 3;
    case RoomType.moreThanThreeUsers:
      return membersCount >= 9;
  }
}