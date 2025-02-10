import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('catfish', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: "postgres",
});