import { defineConfig } from "drizzle-kit";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/features/rooms/models",
    "./src/features/chat/models",
    "./src/features/authentication/models",
  ],
  dbCredentials: {
    host: isProduction ? process.env.PROD_DATABASE_HOST! : process.env.DEV_DATABASE_HOST!,
    user: isProduction ? process.env.PROD_DATABASE_USERNAME! : process.env.DEV_DATABASE_USERNAME!,
    password: isProduction ? process.env.PROD_DATABASE_PASSWORD! : process.env.DEV_DATABASE_PASSWORD!,
    database: isProduction ? process.env.PROD_DATABASE_NAME! : process.env.DEV_DATABASE_NAME!,
    port: Number(isProduction ? process.env.PROD_DATABASE_PORT! : process.env.DEV_DATABASE_PORT!),
    ssl: process.env.NODE_ENV === "production",
  },
});