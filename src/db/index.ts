import { Sequelize } from "sequelize";

const sequelize = new Sequelize("bitespeed", "root", "123123", {
  host: "localhost",
  dialect: "mysql",
});

export { sequelize };
