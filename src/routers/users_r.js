import express from "express";
import {
  getAllUserData,
  getAllUserPagination,
  getUserBy,
  putUpdateUserNoFile,
  putUpdateUserProfilePicture,
  putUpdateUserWithSession
} from "../controllers/users_c.js";
import multer from "multer";
import uniqid from "uniqid";
import authChecker from "../middlewares/authorization_checker.js";

const userRouter = express.Router();

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

// ------------ EndPoint ------------ //
userRouter.get(
  "/get-all/:page/:filter",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getAllUserPagination
);
userRouter.get(
  "/users/all-data",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getAllUserData
);
userRouter.get(
  "/get-by/:filter",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  getUserBy
);
userRouter.put(
  "/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  putUpdateUserNoFile
);
userRouter.put(
  "/profile-picture/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  upload.fields([{ name: "profile_picture", maxCount: 1 }]),
  putUpdateUserProfilePicture
);

userRouter.put(
  "/user-w-session/:uid",
  (req, res, next) => authChecker(req, res, next, [1, 2, 3]),
  putUpdateUserWithSession
);

export default userRouter;
