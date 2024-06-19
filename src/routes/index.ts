import { Router, Request, Response } from "express";
import Contact from "../Models/Contact";
import { Sequelize, Op } from "sequelize";
import identifyLogic from "../controller/contact.controller";

const route = Router();

//health check route
route.get("/health-check", (req: Request, res: Response) => {
  try {
    res.status(200).send("App is healthy");
  } catch (err) {
    console.log("Error : ", err);
  }
});

route.post("/identify", identifyLogic);

export default route;
