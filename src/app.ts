import express from "express";
import chalk from "chalk";
import cors from "cors";
import { config } from "./config";
import route from "./routes";
import { sequelize } from "./db";
import Contact from "./Models/Contact";

const { PORT, HOST } = config;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", route);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await Contact
    await sequelize.sync({ force: true });

    console.log("Database synchronized successfully.");

    app.listen(PORT, () => {
      console.log(
        `Application is running on ${chalk.blue(`http://${HOST}:${PORT}`)}`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();

