import express from "express";
import {
  deleteMenuData,
  deleteMenuGroup,
  getMenuAll,
  getMenuBy,
  getMenuGroupBy,
  postAddMenu,
  postGroupMenu,
  putGroupMenu,
  putMenu,
} from "../controllers/menu_c.js";
import authChecker from "../middlewares/authorization_checker.js";

const menuRouter = express.Router();

// Menu Group
menuRouter.post(
  "/group-menu",
  (req, res, next) => authChecker(req, res, next, [1]),
  postGroupMenu
);
menuRouter.get(
  "/group-menu-by/:filter",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getMenuGroupBy
);
menuRouter.put(
  "/group-menu/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  putGroupMenu
);
menuRouter.delete(
  "/group-menu/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  deleteMenuGroup
);

menuRouter.post(
  "/menu",
  (req, res, next) => authChecker(req, res, next, [1]),
  postAddMenu
);
menuRouter.get(
  "/menu-by/:filter",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getMenuBy
);
menuRouter.get(
  "/menu",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getMenuAll
);
menuRouter.put(
  "/menu/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  putMenu
);
menuRouter.delete(
  "/menu/:id",
  (req, res, next) => authChecker(req, res, next, [1]),
  deleteMenuData
);

// Menu

export default menuRouter;
