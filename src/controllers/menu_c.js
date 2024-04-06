import uniqid from "uniqid";
import {
  deleteGroupMenu,
  deleteMenu,
  insertGroupMenu,
  insertMenu,
  selectMenuAll,
  selectMenuBy,
  selectMenuGroupBy,
  updateMenu,
  updateMenuGroup,
} from "../models/menu_m.js";
import { fieldIsEmpty, fieldIsNumber } from "../utils/validation.js";
import { filterConverter } from "../utils/global_function.js";

// ======================== POST  ======================== //

const postGroupMenu = async (req, res, next) => {
  const reqData = req.body;
  const errData = {};
  const reqField = Object.keys(reqData);
  const numberData = ["level_id"];

  // ============ validation ============ //

  // fieldIsEmty

  reqField.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form";
    }
  });

  // field is number

  numberData.forEach((i) => {
    if (!fieldIsNumber(reqData[i])) {
      errData[i] = "Fill in only numbers";
    }
  });

  const errorFields = Object.keys(errData);
  if (errorFields.length === 0) {
    const dataToSave = reqData;
    dataToSave["mgid"] = uniqid();
    const groupMenuData = await selectMenuGroupBy(
      `level_id='${reqData["level_id"]}'`
    );
    if (groupMenuData.length > 0) {
      const highestMenuData = groupMenuData.reduce((acc, curr) => {
        if (curr.order_number > acc.order_number) {
          return curr;
        }
        return acc;
      });
      dataToSave["order_number"] = highestMenuData["order_number"] + 1;
    } else {
      dataToSave["order_number"] = 0;
    }

    const queryRes = await insertGroupMenu(dataToSave);

    if (queryRes) {
      res.status(201).json({
        message: "Success to create group menu.",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed to create goup menu.",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to create goup menu.",
      data: errData,
    });
  }
};

const postAddMenu = async (req, res) => {
  const reqData = req.body;
  const errData = {};
  const reqField = Object.keys(reqData);

  // ============ validation ============ //

  // fieldIsEmty

  reqField.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form";
    }
  });

  const errorFields = Object.keys(errData);
  if (errorFields.length === 0) {
    const dataToSave = reqData;
    dataToSave["mid"] = uniqid();
    const groupMenuData = await selectMenuBy(`mgid='${reqData["mgid"]}'`);
    if (groupMenuData.length > 0) {
      const highestMenuData = groupMenuData.reduce((acc, curr) => {
        if (curr.order_number > acc.order_number) {
          return curr;
        }
        return acc;
      });
      dataToSave["order_number"] = highestMenuData["order_number"] + 1;
    } else {
      dataToSave["order_number"] = 0;
    }

    const queryRes = await insertMenu(dataToSave);

    if (queryRes) {
      res.status(201).json({
        message: "Success to menu.",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed to menu.",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to menu.",
      data: errData,
    });
  }
};

// ======================== GET  ======================== //

const getMenuGroupBy = async (req, res) => {
  const filter = filterConverter(req.params.filter);

  const data = await selectMenuGroupBy(filter);

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

const getMenuBy = async (req, res) => {
  const filter = filterConverter(req.params.filter);

  const data = await selectMenuBy(filter);

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

const getMenuAll = async (req, res) => {
  const data = await selectMenuAll();

  res.status(200).json({
    message: "Success",
    data: data,
  });
};

// ======================== UPDATE  ======================== //

const putGroupMenu = async (req, res) => {
  const reqData = req.body;
  const id = req.params.id;
  const errData = {};
  const reqField = Object.keys(reqData);
  const numberData = ["level_id"];

  // ============ validation ============ //

  // fieldIsEmty

  reqField.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form";
    }
  });

  // field is number

  numberData.forEach((i) => {
    if (!fieldIsNumber(reqData[i])) {
      errData[i] = "Fill in only numbers";
    }
  });

  const errorFields = Object.keys(errData);
  if (errorFields.length === 0) {
    const queryRes = await updateMenuGroup(reqData, id);

    if (queryRes) {
      res.status(201).json({
        message: "Success to update group menu.",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed to update group menu.",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to update group menu.",
      data: errData,
    });
  }
};

const putMenu = async (req, res) => {
  const reqData = req.body;
  const id = req.params.id;
  const errData = {};
  const reqField = Object.keys(reqData);

  // ============ validation ============ //

  // fieldIsEmty

  reqField.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form";
    }
  });

  const errorFields = Object.keys(errData);
  if (errorFields.length === 0) {
    const queryRes = await updateMenu(reqData, id);

    if (queryRes) {
      res.status(201).json({
        message: "Success to update menu.",
        data: reqData,
      });
    } else {
      res.status(500).json({
        message: "Failed to update menu.",
      });
    }
  } else {
    res.status(400).json({
      message: "Failed to update menu.",
      data: errData,
    });
  }
};

// ======================== DELETE  ======================== //

const deleteMenuGroup = async (req, res) => {
  const id = req.params.id;
  const dataToDelete = await selectMenuGroupBy(`mgid='${id}'`);
  const dataToUpdate = await selectMenuGroupBy(
    `order_number > ${dataToDelete[0]["order_number"]}`
  );
  const queryResult = await deleteGroupMenu(id);

  if (!queryResult) {
    dataToUpdate.forEach((i) => {
      const dataUpdateItem = i;
      const mgid = i.mgid;
      delete dataUpdateItem["mgid"];
      dataUpdateItem["order_number"] -= 1;

      updateMenuGroup(dataUpdateItem, mgid);
    });

    res.status(200).json({
      message: "Success to delete menu group",
    });
  } else {
    res.status(500).json({
      message: "Failed to delete menu group",
    });
  }
};

const deleteMenuData = async (req, res) => {
  const id = req.params.id;
  const dataToDelete = await selectMenuBy(`mid='${id}'`);
  const dataToUpdate = await selectMenuBy(
    `order_number > ${dataToDelete[0]["order_number"]}`
  );
  const queryResult = await deleteMenu(id);

  if (!queryResult) {
    dataToUpdate.forEach((i) => {
      const dataUpdateItem = i;
      const mid = i.mid;
      delete dataUpdateItem["mid"];
      dataUpdateItem["order_number"] -= 1;

      updateMenu(dataUpdateItem, mid);
    });

    res.status(200).json({
      message: "Success to delete menu",
    });
  } else {
    res.status(500).json({
      message: "Failed to delete menu",
    });
  }
};

export {
  postAddMenu,
  postGroupMenu,
  getMenuGroupBy,
  getMenuAll,
  putGroupMenu,
  deleteMenuGroup,
  getMenuBy,
  putMenu,
  deleteMenuData,
};
