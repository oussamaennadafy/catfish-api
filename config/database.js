import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: "catfish_db",
  username: "postgres",
  password: "oussama.aws.rds.catfish",
  host: "catfish.cmd8yamys2yk.us-east-1.rds.amazonaws.com",
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // This will help you. But you will see nwe error
      rejectUnauthorized: false // This line will fix new error
    }
  },
});