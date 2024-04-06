// ======================== POST  ======================== //

import {
  deleteLevelById,
  insertLevel,
  selectAllLevel,
  selectLevelBy,
  updateLevelId,
} from "../models/level_m.js";
import { filterConverter } from "../utils/global_function.js";
import { fieldIsEmpty } from "../utils/validation.js";

const postAddLevel = async (req, res) => {
  const reqData = req.body;
  const errData = {};
  const field = Object.keys(reqData);

  // ------------------- Validation ------------------- //

  // Check if field is not empty
  field.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form!";
    }
  });

  // Check if id not registered

  const similiarData = await selectLevelBy(`level_id='${reqData["level_id"]}'`);

  if (similiarData.length > 0) {
    errData["level_id"] = "This ID has been registered";
  }

  // ---------------------------------------------------//

  const errDataField = Object.keys(errData);

  if (errDataField.length === 0) {
    const queryResult = await insertLevel(reqData);

    if (queryResult) {
      res.status(201).json({
        message: "Success",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed To Create Level User",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to create level",
      data: errData,
    });
  }
};

// ======================== GET  ======================== //

const getAllLevelData = async (req, res) => {
  const queryResult = await selectAllLevel();

  if (queryResult) {
    res.status(201).json({
      message: "Success",
      data: queryResult,
    });
  } else {
    res.status(500).json({
      message: "Failed To Get Level User",
    });
  }
};

const getLevelBy = async (req, res) => {
  const filter = filterConverter(req.params.filter);

  const data = await selectLevelBy(filter);

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

// ======================== UPDATE  ======================== //

const putLevelId = async (req, res) => {
  const reqData = req.body;
  const id = req.params.id;
  const errData = {};
  const field = Object.keys(reqData);

  // ------------------- Validation ------------------- //

  // Check if field is not empty
  field.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form!";
    }
  });

  // Check if id not registered

  const similiarData = await selectLevelBy(`level_id='${id}'`);

  if (similiarData.length === 0) {
    errData["level_id"] = "Your id was not found.";
  }

  // ---------------------------------------------------//

  const errDataField = Object.keys(errData);

  if (errDataField.length === 0) {
    const queryResult = await updateLevelId(reqData, id);

    if (queryResult) {
      res.status(201).json({
        message: "Success",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed To Update Level User",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to Update level",
      data: errData,
    });
  }
};

// ======================== DELETE  ======================== //
const deleteLevelId = async (req, res) => {
  const levelId = req.params.id;

  // check if id is exist
  const checkIdIsRegistered = await selectLevelBy(`level_id='${levelId}'`);

  if (checkIdIsRegistered.length > 0) {
    const queryRes = await deleteLevelById(levelId);

    if (!queryRes) {
      res.status(200).json({
        message: "Success to delete id",
      });
    } else {
      res.status(500).json({
        message: "Failed to delete id",
      });
    }
  } else {
    res.status(404).json({
      message: "Your level id is not found",
    });
  }
};

export { postAddLevel, getAllLevelData, deleteLevelId, getLevelBy, putLevelId };
