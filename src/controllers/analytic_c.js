import uniqid from "uniqid";
import { fieldIsEmpty, fieldIsNumber } from "../utils/validation.js";
import { selectVisitorDayBy } from "../models/analytic_m.js";

// ============================= POST ============================= //
const postAddNewDay = (req, res) => {
  const d = new Date();

  const reqData = req.body;
  const errData = {};

  //   form validation
  for (const key in reqData) {
    if (fieldIsEmpty(reqData[key])) {
      errData[key] = "Please complete this form!.";
      if (!fieldIsNumber(reqData[key])) {
        errData[key] = "Please input number";
      }
    }
  }

  //   save data to database
  if (Object.keys(errData).length === 0) {
    res.status(200).json({
      message: "Success",
    });
  } else {
    res.status(400).json({
      message: "Failed",
      data: errData,
    });
  }
};
// ============================= GET ============================= //
// ============================= PUT ============================= //
// ============================= DELETE ============================= //

export { postAddNewDay };
