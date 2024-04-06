import Joi from "joi";
import {
  selectAllDataUsers,
  selectUserAll,
  selectUsersBy,
  updateUser
} from "../models/users_m.js";
import { numberConverter } from "../utils/converter.js";
import { capitalizeEachWord } from "../utils/global_function.js";
import {
  fieldIsEmpty,
  fieldIsValidEmail,
  filedIsPhoneNumber
} from "../utils/validation.js";
import fs from "fs";
import jwt from "jsonwebtoken";

// ======================== GET  ======================== //

const getAllUserPagination = async (req, res) => {
  const limit = 30;
  const page = (req.params.page - 1) * limit;
  const filter = req.params.filter;

  const data = await selectUserAll(filter);
  const totalPage = Math.ceil(data.length / limit);

  res.status(200).json({
    message: "Success",
    data: data.slice(page, limit * req.params.page),
    totalPage: totalPage === 0 ? 1 : totalPage,
    totalUser: data.length
  });
};

const getUserBy = async (req, res) => {
  const filter = req.params.filter;

  const data = await selectUsersBy(filter);

  res.status(200).json({
    message: "Success",
    data: data
  });
};

const getAllUserData = async (req, res) => {
  const data = await selectAllDataUsers();

  res.status(200).json({
    message: "Success",
    data: data
  });
};

// ======================== POST  ======================== //

// ======================== UPDATE  ======================== //
const putUpdateUserNoFile = async (req, res) => {
  const reqData = req.body;
  const fields = Object.keys(reqData);
  const uid = req.params.uid;
  const errData = {};

  //   ********************* validation ********************* //

  // check if field not empty

  fields.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form!";
    }
  });

  // check email is valid and not registered

  if (!fieldIsValidEmail(reqData["email"])) {
    errData["email"] = "Your email is invalid";
  }

  const filter = `email = '${reqData["email"]}'`;

  const emailResult = await selectUsersBy(filter);

  if (emailResult.length > 0 && emailResult[0]["uid"] !== uid) {
    errData["email"] = "This email has been registered";
  }

  console.log("sas1", emailResult[0]["uid"]);
  console.log("sas2", uid);

  // check username is not registered

  const filterUsername = `username = '${reqData["username"]}'`;

  const userNameResult = await selectUsersBy(filterUsername);

  if (userNameResult.length > 0 && emailResult[0]["uid"] !== uid) {
    errData["username"] = "This username has been registered";
  }

  // Number Validation

  if (filedIsPhoneNumber(reqData["phone"])) {
    reqData["phone"] = numberConverter(reqData["phone"]);
  } else {
    errData["phone"] = "Your phone number is invalid";
  }

  //   ********************* response ********************* //
  const errFields = Object.keys(errData);

  if (errFields.length > 0) {
    res.status(400).json({
      message: "Failed to upadate user",
      data: errData
    });
  } else {
    const dataToSave = reqData;
    dataToSave["full_name"] = capitalizeEachWord(reqData.full_name);
    const queryRes = await updateUser(dataToSave, uid);
    if (queryRes) {
      res.status(200).json({
        message: "User Update Success",
        data: dataToSave
      });
    } else {
      res.status(500).json({
        message: "Failed to update user"
      });
    }
  }
};

const putUpdateUserProfilePicture = async (req, res) => {
  const uid = req.params.uid;
  const reqFileData = req.files.profile_picture;
  const userData = await selectUsersBy(`uid='${uid}'`);

  if (userData.length > 0) {
    if (reqFileData !== undefined) {
      const ppData = reqFileData[0];
      const fileName = ppData["filename"];
      const dataToUpdate = {
        profile_picture: fileName
      };

      const queryResult = await updateUser(dataToUpdate, uid);

      const profilePicturePath = `./uploads/images/${userData[0]["profile_picture"]}`;
      fs.unlink(profilePicturePath, (err) => console.log(err));

      if (queryResult) {
        res.status(200).json({
          message: "Success"
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
          data: {
            profile_picture:
              "There is errors in database query. Please check your code"
          }
        });
      }
    } else {
      res.status(500).json({
        message: "Internal Server Error",
        data: {
          profile_picture: "Please complete this field"
        }
      });
    }
  } else {
    res.status(404).json({
      message: "User Not Found",
      data: {
        profile_picture: "User Not Found"
      }
    });
  }
};

const putUpdateUserWithSession = (req, res) => {
  const reqData = req.body;
  const uid = req.params.uid;

  const validationSchema = Joi.object({
    full_name: Joi.string().messages({
      "string.empty": "Mohon lengkapi isian ini."
    }),
    level_id: Joi.string().messages({
      "string.empty": "Mohon lengkapi isian ini."
    }),
    phone: Joi.string()
      .regex(/^(08|\+62|62)/)
      .allow("", null)
      .messages({
        "string.pattern.base": "Nomor telepon Anda tidak valid."
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .messages({
        "string.email": "Mohon masukkan email valid.",
        "string.empty": "Mohon lengkapi isian ini."
      }),
    address: Joi.string().allow("", null).messages({
      "string.empty": "Mohon lengkapi isian ini."
    }),
    gender: Joi.string().allow("", null).messages({
      "string.empty": "Mohon lengkapi isian ini."
    }),
    account_status: Joi.string().allow("", null).messages({
      "string.empty": "Mohon lengkapi isian ini."
    }),
    dark_mode: Joi.number().allow("", null).messages({
      "number.empty": "Mohon lengkapi isian ini."
    })
  });

  const { error, value } = validationSchema.validate(reqData, {
    abortEarly: false
  });

  if (!error) {
    const dataToUpdate = reqData;

    updateUser(dataToUpdate, uid)
      .then((updateResult) => {
        const token = req.headers.authorization;

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          if (!err) {
            const credentials = decoded;

            fs.readFile(
              `./sessions/${credentials["login_id"]}.json`,
              "utf8",
              async (err, data) => {
                if (err) {
                  console.error("Error reading file:", err);
                  res.status(500).json({
                    message: "Your session is not found"
                  });
                  return;
                }

                try {
                  const jsonData = JSON.parse(data);
                  const newSession = { ...jsonData };

                  Object.keys(reqData).map((i) => (newSession[i] = reqData[i]));

                  const jsonDataUpdate = JSON.stringify(newSession);

                  fs.writeFile(
                    `./sessions/${jsonData["login_id"]}.json`,
                    jsonDataUpdate,
                    (err) => {
                      console.log(err);
                    }
                  );

                  res.status(200).json({
                    message: "Update session success",
                    data: {},
                    error: {}
                  });
                } catch (error) {
                  res.status(500).json({
                    message: "Failed to parse JSON",
                    data: {},
                    error: {}
                  });
                }
              }
            );
          } else {
            res.status(404).json({
              message: "Your id is invalid",
              data: {},
              error: {}
            });
          }
        });

        // res.status(200).json({
        //   message: "Success",
        //   data: {},
        //   error: {}
        // });
      })
      .catch((updateError) => {
        console.log(updateError);
        res.status(500).json({
          message: "Internal server error",
          data: {},
          error: {}
        });
      });
  } else {
    const errors = {};

    error.details.map((detail) => {
      errors[detail.context.key] = detail.message;
    });

    res.status(400).json({
      message: "Failed",
      data: {},
      error: errors
    });
  }
};

// ======================== DELETE  ======================== //

export {
  getAllUserPagination,
  getAllUserData,
  putUpdateUserNoFile,
  getUserBy,
  putUpdateUserProfilePicture,
  putUpdateUserWithSession
};
