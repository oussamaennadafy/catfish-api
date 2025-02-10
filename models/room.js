import { DataTypes } from "sequelize";
import { sequelize } from "./../config/database.js";

export const Room = sequelize.define(
  'rooms',
  {
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
