import express from "express";
import {
  deleteRemoveNotif,
  deleteRemoveNotifAll,
  getAllNotifPagination,
  getIsReadNotif,
  postNotification,
  putNotif,
  putNotifReadAll,
} from "../controllers/notification_c.js";
import authChecker from "../middlewares/authorization_checker.js";
import { deleteNotifAll } from "../models/notification_m.js";

const notificationRouter = express.Router();

notificationRouter.post(
  "/",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  postNotification
);

notificationRouter.get(
  "/:uid/:page",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getAllNotifPagination
);

notificationRouter.get(
  "/notif/total-notif/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getIsReadNotif
);

notificationRouter.put(
  "/:nid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  putNotif
);

notificationRouter.put(
  "/read-all/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  putNotifReadAll
);

notificationRouter.delete(
  "/:nid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  deleteRemoveNotif
);

notificationRouter.delete(
  "/delete-all/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  deleteRemoveNotifAll
);

export default notificationRouter;
