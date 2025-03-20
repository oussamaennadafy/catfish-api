import { boolean, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { RoomTypeEnum } from "../types/roomTypes.ts";
import { enumToPgEnum } from "@/utils/database/enumToPgEnum.ts";

export const roomModel = pgTable('rooms', {
  id: serial("id").primaryKey(),
  type: varchar('type', { enum: enumToPgEnum(RoomTypeEnum) }).notNull(),
  membersCount: integer("members_count").default(1),
  isFull: boolean("is_full").default(false),
});