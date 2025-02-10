export const isRoomFull = (roomType, membersCount) => {
  switch (roomType) {
    case "twoUsers":
      return membersCount >= 2;
    case "threeUsers":
      return membersCount >= 3;
    case "moreThanThreeUsers":
      return membersCount >= 9;
  }
}