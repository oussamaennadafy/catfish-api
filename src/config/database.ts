import { roomModel } from "@/features/rooms/models/roomModel.ts";
import { drizzle } from "drizzle-orm/node-postgres";

const DATABASE_NAME = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_NAME : process.env.DEV_DATABASE_NAME;
const DATABASE_USERNAME = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_USERNAME : process.env.DEV_DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PASSWORD : process.env.DEV_DATABASE_PASSWORD;
const DATABASE_HOST = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_HOST : process.env.DEV_DATABASE_HOST;
const DATABASE_PORT = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PORT : process.env.DEV_DATABASE_PORT;

const sslmode = process.env.NODE_ENV === "production" ? "sslmode=no-verify" : "";

export const DB_URL = `postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?${sslmode}`;

export const db = drizzle(DB_URL);

db.$count(roomModel).then(roomsCount => {
  console.log("db connected : ", { roomsCount });
})