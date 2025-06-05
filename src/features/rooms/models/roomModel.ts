import { boolean, pgTable, serial, integer } from "drizzle-orm/pg-core";

export const roomModel = pgTable('rooms', {
  id: serial("id").primaryKey(),
  isFull: boolean("is_full").default(false),
  membersCount: integer("members_count").default(1),
});