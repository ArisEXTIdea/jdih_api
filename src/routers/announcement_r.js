import express from "express";
import {
  deleteDataAnnouncement,
  getAllAnnouncementPagination,
  getDataAnnouncementAll,
  getDataAnnouncementByAid,
  postNewAnnouncement,
  putDataAnnouncement,
} from "../controllers/announcement_c.js";
import multer from "multer";
import uniqid from "uniqid";
import authChecker from "../middlewares/authorization_checker.js";

const announcementRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").reverse()[0];
    var fileNameFormat = "";
    fileNameFormat = `banner-announcement-${uniqid()}.${extension}`;
    cb(null, fileNameFormat);
  },
});

const upload = multer({ storage: storage });

announcementRouter.post(
  "/",
  upload.fields([{ name: "banner", maxCount: 1 }]),
  (req, res, next) => authChecker(req, res, next, [1, 2]),
  postNewAnnouncement
);
announcementRouter.get(
  "/",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getDataAnnouncementAll
);
announcementRouter.get(
  "/page/:page",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getAllAnnouncementPagination
);
announcementRouter.get(
  "/:aid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getDataAnnouncementByAid
);
announcementRouter.put(
  "/:aid",
  upload.fields([{ name: "banner", maxCount: 1 }]),
  (req, res, next) => authChecker(req, res, next, [1, 2]),
  putDataAnnouncement
);
announcementRouter.delete(
  "/:aid",
  (req, res, next) => authChecker(req, res, next, [1, 2]),
  deleteDataAnnouncement
);

export default announcementRouter;
