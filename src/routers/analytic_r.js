import express from "express";
import { postAddNewDay } from "../controllers/analytic_c.js";

const analyticRouter = express.Router();

analyticRouter.post("/", postAddNewDay);

export default analyticRouter;
