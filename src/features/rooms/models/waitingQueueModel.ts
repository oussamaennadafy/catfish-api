import {  users } from "@/features/authentication/models/userModel.ts";
import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";

export const waitingQueueModel = pgTable('waiting_queue', {
  id: serial("id").primaryKey(),
  socketId: varchar("socket_id").notNull(),
  roomType: varchar('room_type').notNull(),
  userId: integer("user_id").references(() => users.id), // this is a foreign key
});