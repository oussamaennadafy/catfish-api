import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../../config/database.ts";

export interface RoomModelType extends Model<InferAttributes<RoomModelType>, InferCreationAttributes<RoomModelType>> {
  id: CreationOptional<number>,
  roomType: string,
  membersCount: number,
  isFull: boolean,
}

export const RoomModel = sequelize.define<RoomModelType>(
  "rooms",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
    },
    roomType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    membersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isFull: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
);
