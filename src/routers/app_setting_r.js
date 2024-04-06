import express from "express";
import {
  deleteRemoveSetting,
  getAllSetting,
  getAllSettingNoPage,
  getSettingBySid,
  postCreateNewSetting,
  putBrandImage,
  putSetting,
} from "../controllers/app_setting_c.js";
import multer from "multer";
import uniqid from "uniqid";
import authChecker from "../middlewares/authorization_checker.js";
const appSettingRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").reverse()[0];
    var fileNameFormat = "";
    switch (file["fieldname"]) {
      case "brand_image":
        fileNameFormat = `brand-${uniqid()}.${extension}`;
        break;
      case "brand_image_dark_mode":
        fileNameFormat = `brand-dark-mode-${uniqid()}.${extension}`;
        break;
    }
    cb(null, fileNameFormat);
  },
});

const upload = multer({ storage: storage });

appSettingRouter.post(
  "/",
  authChecker,
  upload.fields([
    { name: "brand_image", maxCount: 1 },
    { name: "brand_image_dark_mode", maxCount: 1 },
  ]),
  postCreateNewSetting
);

appSettingRouter.put(
  "/brand/:sid",
  authChecker,
  upload.fields([
    { name: "brand_image", maxCount: 1 },
    { name: "brand_image_dark_mode", maxCount: 1 },
  ]),
  putBrandImage
);

appSettingRouter.put(
  "/update/:sid",
  (req, res, next) => authChecker(req, res, next, [1]),
  putSetting
);
appSettingRouter.get("/:page/:filter", getAllSetting);
appSettingRouter.get("/", getAllSettingNoPage);
appSettingRouter.get("/:sid", getSettingBySid);
appSettingRouter.delete(
  "/:sid",
  (req, res, next) => authChecker(req, res, next, [1]),
  deleteRemoveSetting
);

export default appSettingRouter;
