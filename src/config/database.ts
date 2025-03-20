import { drizzle } from "drizzle-orm/node-postgres"

const DATABASE_NAME = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_NAME : process.env.DEV_DATABASE_NAME;
const DATABASE_USERNAME = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_USERNAME : process.env.DEV_DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PASSWORD : process.env.DEV_DATABASE_PASSWORD;
const DATABASE_HOST = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_HOST : process.env.DEV_DATABASE_HOST;
const DATABASE_PORT = process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PORT : process.env.DEV_DATABASE_PORT;

export const DB_URL = `postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

export const db = drizzle(DB_URL);