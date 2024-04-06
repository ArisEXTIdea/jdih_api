import uniqid from "uniqid";
import { fieldIsEmpty } from "../utils/validation.js";
import fs from "fs";
import {
  deleteSettingBySid,
  insertNewWebSetting,
  selectAllSetting,
  selectAllSettingNoPage,
  updateSettingBySid,
} from "../models/app_setting_m.js";

// ====================== POST ====================== //

const postCreateNewSetting = (req, res) => {
  const reqData = req.body;
  const reqFileData = req.files;
  const reqDataField = Object.keys(reqData);
  const reqFileField = Object.keys(reqFileData);
  const errData = {};

  reqDataField.map((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this field!";
    }
  });

  if (reqFileField.length > 0) {
    reqFileField.map((i) => {
      if (fieldIsEmpty(reqFileData[i])) {
        errData[i] = "Please complete this field!";
      }
    });
  } else {
    errData["brand_image"] = "Please complete this field!";
  }

  if (Object.keys(errData).length > 0) {
    reqFileField.map((i) => {
      const path = `./uploads/images/${reqFileData[i][0]["filename"]}`;
      fs.unlink(path, (err) => console.log(err));
    });

    res.status(400).json({
      message: "Failed",
      data: errData,
    });
  } else {
    const dataToSave = reqData;

    dataToSave["sid"] = uniqid();
    dataToSave["brand_image"] = reqFileData["brand_image"][0]["filename"];
    dataToSave["brand_image_dark_mode"] =
      reqFileData["brand_image_dark_mode"][0]["filename"];
    dataToSave["setting_status"] = "0";

    const queryResult = insertNewWebSetting(dataToSave);

    if (queryResult) {
      res.status(201).json({
        message: "Success",
      });
    } else {
      res.status(500).json({
        message: "Failed",
        data: errData,
      });
    }
  }
};

// ====================== GET ====================== //

const getAllSetting = async (req, res) => {
  const limit = 30;
  const page = (req.params.page - 1) * limit;
  const filter = req.params.filter;

  const data = await selectAllSetting(filter);

  const totalPage = Math.ceil(data.length / limit);

  res.status(200).json({
    message: "Success",
    data: data.slice(page, limit * req.params.page),
    totalPage: totalPage === 0 ? 1 : totalPage,
    totalItem: data.length,
  });
};

const getAllSettingNoPage = async (req, res) => {
  const data = await selectAllSettingNoPage();

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

const getSettingBySid = async (req, res) => {
  const sid = req.params.sid;

  const data = await selectAllSetting(`sid='${sid}'`);

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

// ====================== UDPATE ====================== //

const putBrandImage = async (req, res) => {
  const sid = req.params.sid;
  const fileDataField = Object.keys(req.files)[0];
  const reqFileData = req.files[fileDataField][0];
  console.log(fileDataField);

  const findSetting = await selectAllSetting(`sid='${sid}'`);

  if (findSetting.length > 0) {
    const oldFileName = findSetting[0][fileDataField];

    const dataToSave = {};
    dataToSave[fileDataField] = reqFileData["filename"];

    const queryRes = await updateSettingBySid(dataToSave, sid);

    if (queryRes) {
      const path = `./uploads/images/${oldFileName}`;
      fs.unlink(path, (err) => console.log(err));

      res.status(200).json({
        message: "Success",
      });
    } else {
      res.status(500).json({
        message: "Failed",
      });
    }
  } else {
    res.status(404).json({
      message: "Setting Not Found",
    });
  }
};

const putSetting = async (req, res) => {
  const reqData = req.body;
  const reqField = Object.keys(reqData);
  const sid = req.params.sid;
  const errData = {};

  reqField.map((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Field is empty";
    }
  });

  if (Object.keys(errData).length === 0) {
    const findSetting = await selectAllSetting(`sid='${sid}'`);

    if (findSetting.length > 0) {
      const queryRes = await updateSettingBySid(reqData, sid);

      if (queryRes) {
        res.status(200).json({
          message: "Success",
        });
      } else {
        res.status(500).json({
          message: "Failed",
        });
      }
    } else {
      res.status(400).json({
        message: "Failed",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed",
      data: errData,
    });
  }
};

// ====================== DELETE ====================== //
const deleteRemoveSetting = async (req, res) => {
  const sid = req.params.sid;

  const findSetting = await selectAllSetting(`sid='${sid}'`);

  if (findSetting.length > 0) {
    const dataToDelete = findSetting[0];

    const queryRes = await deleteSettingBySid(sid);

    if (queryRes) {
      const pathBrandLight = `./uploads/images/${dataToDelete.brand_image}`;
      const pathBrandDark = `./uploads/images/${dataToDelete.brand_image_dark_mode}`;
      fs.unlink(pathBrandLight, (err) => console.log(err));
      fs.unlink(pathBrandDark, (err) => console.log(err));
      res.status(200).json({
        message: "Success",
      });
    } else {
      res.status(500).json({
        message: "Failed to delete setting",
      });
    }
  } else {
    res.status(404).json({
      message: "Setting Not Found",
    });
  }
};

export {
  postCreateNewSetting,
  getAllSetting,
  getSettingBySid,
  getAllSettingNoPage,
  deleteRemoveSetting,
  putBrandImage,
  putSetting,
};
