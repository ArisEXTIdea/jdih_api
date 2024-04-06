import express from "express";
import multer from "multer";
import uniqid from "uniqid";

import {
  getAddVisitor,
  getLoginLogBy,
  getOtpByOid,
  getVerifyOtp,
  getVisitorData,
  postCreateAccount,
  postGetSessionData,
  postLoginUser,
  postLogutUser,
  postOTP,
  putUpdatePassword,
  putUpdateSession
} from "../controllers/auth_c.js";
import authChecker from "../middlewares/authorization_checker.js";
import { getUserBy } from "../controllers/users_c.js";

const authRouter = express.Router();

// -------- Multer Configs -------- //

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").reverse()[0];
    var fileNameFormat = "";
    switch (file["fieldname"]) {
      case "profile_picture":
        fileNameFormat = `profile-picture-${uniqid()}.${extension}`;
        break;
    }
    cb(null, fileNameFormat);
  }
});

const upload = multer({ storage: storage });

// ======================================= Endpoint ======================================= //

authRouter.post(
  "/create-account",
  upload.fields([{ name: "profile_picture", maxCount: 1 }]),
  postCreateAccount
);

authRouter.post("/login", postLoginUser);
authRouter.post("/logout", postLogutUser);
authRouter.post("/session", postGetSessionData);
authRouter.post("/otp/:uid", postOTP);
authRouter.put("/password/:uid", putUpdatePassword);
authRouter.put(
  "/session",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  putUpdateSession
);

authRouter.get("/otp/verify/:uid/:otp", getVerifyOtp);

authRouter.get(
  "/login-log-by/:filter",
  (req, res, next) => authChecker(req, res, next, [1]),
  getLoginLogBy
);

authRouter.get("/get-by/:filter", getUserBy);
authRouter.get("/otp/get-data/:oid", getOtpByOid);
authRouter.get("/visitor/add", getAddVisitor);
authRouter.get("/visitor", getVisitorData);

export default authRouter;
