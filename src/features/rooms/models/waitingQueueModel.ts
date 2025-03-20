import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const waitingQueueModel = pgTable('waiting_queue', {
  id: serial("id").primaryKey(),
  socketId: varchar("socket_id").notNull(),
  roomType: varchar('room_type').notNull(),
});