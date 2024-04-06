import express from "express";
import {
  deleteLevelId,
  getAllLevelData,
  getLevelBy,
  postAddLevel,
  putLevelId,
} from "../controllers/level_c.js";
import authChecker from "../middlewares/authorization_checker.js";

const levelRouter = express.Router();

levelRouter.post(
  "/",
  (req, res, next) => authChecker(req, res, next, [1]),
  postAddLevel
);
levelRouter.get(
  "/",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getAllLevelData
);
levelRouter.get(
  "/:filter",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getLevelBy
);
levelRouter.put(
  "/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  putLevelId
);
levelRouter.delete(
  "/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  deleteLevelId
);

export default levelRouter;
