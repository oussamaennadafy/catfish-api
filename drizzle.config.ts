import { defineConfig } from "drizzle-kit";
import { DB_URL } from "./src/config/database"

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/features/rooms/models",
    "./src/features/chat/models",
    "./src/features/authentication/models",
  ],
  dbCredentials: {
    url: DB_URL,
  },
})