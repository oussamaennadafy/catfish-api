import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import 'dotenv/config';


// Use environment variables directly to match your server
const { Pool } = pg;
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: isProduction ? process.env.PROD_DATABASE_USERNAME : process.env.DEV_DATABASE_USERNAME,
  password: isProduction ? process.env.PROD_DATABASE_PASSWORD : process.env.DEV_DATABASE_PASSWORD,
  host: isProduction ? process.env.PROD_DATABASE_HOST : process.env.DEV_DATABASE_HOST,
  port: Number(isProduction ? process.env.PROD_DATABASE_PORT : process.env.DEV_DATABASE_PORT),
  database: isProduction ? process.env.PROD_DATABASE_NAME : process.env.DEV_DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool);

// Output information about the connection
console.log(`Connecting to ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} database:`, {
  host: isProduction ? process.env.PROD_DATABASE_HOST : process.env.DEV_DATABASE_HOST,
  database: isProduction ? process.env.PROD_DATABASE_NAME : process.env.DEV_DATABASE_NAME,
});

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed!", err);
  console.error(err);
  process.exit(1);
});