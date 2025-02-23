import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_NAME : process.env.DEV_DATABASE_NAME,
  username: process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_USERNAME : process.env.DEV_DATABASE_USERNAME,
  password: process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PASSWORD : process.env.DEV_DATABASE_PASSWORD,
  host: process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_HOST : process.env.DEV_DATABASE_HOST,
  port: process.env.NODE_ENV === "production" ? process.env.PROD_DATABASE_PORT : process.env.DEV_DATABASE_PORT,
  dialect: "postgres",
  dialectOptions: {
    ssl:  process.env.NODE_ENV === "production" ? {
      require: true,
      rejectUnauthorized: false
    } : undefined,
  },
});