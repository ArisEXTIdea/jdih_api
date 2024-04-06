import fs from "fs";
import {
  fieldFileExtensionIsAllowed,
  fieldFileIsEmpty,
  fieldIsEmpty,
  fieldIsValidEmail,
  filedFileSizeIsLessThan,
  filedIsPhoneNumber,
  strMinLength
} from "../utils/validation.js";
import {
  insertLoginLog,
  insertOtp,
  insertUser,
  insertVisitor,
  selectLoginLogBy,
  selectOtpByOid,
  selectOtpByUid,
  selectUsersBy,
  selectVisitorBy,
  updateOtp,
  updateVisitors
} from "../models/auth_m.js";
import { numberConverter } from "../utils/converter.js";
import uniqid from "uniqid";
import bcrypt from "bcrypt";
import {
  capitalizeEachWord,
  filterConverter2,
  haveErrors
} from "../utils/global_function.js";
import jwt from "jsonwebtoken";
import whatsappSender from "../utils/whatssap.js";
import { updateUser } from "../models/users_m.js";
import { json } from "express";

// ========================================== POST  ========================================== //

const postCreateAccount = async (req, res) => {
  const reqData = req.body;
  const fileData = req.files;
  const fields = Object.keys(reqData);
  const errData = {};

  //   ********************* form validation ********************* //

  // check field is not empty
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

  if (emailResult.length > 0) {
    errData["email"] = "This email has been registered";
  }

  // check username is not registered
  if (!fieldIsValidEmail(reqData["email"])) {
    errData["email"] = "Your email is invalid";
  }

  const filterUsername = `username = '${reqData["username"]}'`;
  const userNameReult = await selectUsersBy(filterUsername);

  if (userNameReult.length > 0) {
    errData["username"] = "This username has been registered";
  }

  // Number Validation
  if (filedIsPhoneNumber(reqData["phone"])) {
    reqData["phone"] = numberConverter(reqData["phone"]);
  } else {
    errData["phone"] = "Your phone number is invalid";
  }

  // file validation
  if (fileData !== undefined) {
    if (fieldFileIsEmpty(fileData, "profile_picture")) {
      errData["profile_picture"] = "You haven't uploaded a profile picture";
    } else {
      if (
        !filedFileSizeIsLessThan(
          fileData["profile_picture"][0]["size"],
          2097152
        )
      ) {
        errData["profile_picture"] = "Your file is too large";
      }
      if (
        !fieldFileExtensionIsAllowed(
          ["png", "jpg", "jpeg"],
          fileData["profile_picture"][0]["mimetype"].split("/").reverse()[0]
        )
      ) {
        errData["profile_picture"] = "File extensions are not allowed";
      }
    }
  } else {
    errData["profile_picture"] = "You haven't uploaded a profile picture";
  }

  // password validation
  if (strMinLength(reqData["password"], 6)) {
    const salt = bcrypt.genSaltSync(10);
    reqData["password"] = bcrypt.hashSync(reqData["password"], salt);
  } else {
    errData["password"] = "Your password is less than 6 characters";
  }

  //   ********************* response ********************* //

  const errFields = Object.keys(errData);
  if (errFields.length > 0) {
    if (fileData !== undefined) {
      if (fileData["profile_picture"] !== undefined) {
        const path = `./uploads/images/${fileData["profile_picture"][0]["filename"]}`;
        fs.unlink(path, (err) => console.log(err));
      }
    }
    res.status(400).json({
      message: "Failed to create user",
      data: errData
    });
  } else {
    const d = new Date();
    const dataToSave = reqData;
    dataToSave["uid"] = uniqid();
    dataToSave["level_id"] = 3;
    dataToSave["account_status"] = 1;
    dataToSave["created_at"] = d.getTime();
    dataToSave["profile_picture"] = fileData["profile_picture"][0]["filename"];
    dataToSave["full_name"] = capitalizeEachWord(reqData.full_name);

    if (insertUser(dataToSave)) {
      res.status(201).json({
        message: "User Created",
        data: dataToSave
      });
    } else {
      res.status(500).json({
        message: "Failed to create user"
      });
    }
  }
};

const postLoginUser = async (req, res, next) => {
  const reqData = req.body;
  const fields = Object.keys(reqData);
  const reqUsernamae = req.body.username;
  const reqPassword = req.body.password;
  const errData = {};
  const d = new Date();

  //   ********************* Validation ********************* //

  // check login form is not empty
  fields.forEach((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this form!";
    }
  });

  if (!haveErrors(errData)) {
    // Check username is regitered
    const usernames = await selectUsersBy(`username='${reqUsernamae}'`);

    if (usernames.length === 0) {
      errData["username"] = "Your username is not registered";
    }

    //   ********************* response ********************* //

    if (haveErrors(errData)) {
      res.status(404).json({
        messgae: "Login Failed",
        errors: errData
      });
    } else {
      const user = usernames[0];
      const encryptedPassword = user.password;

      // password validation
      const comparePassword = bcrypt.compareSync(
        reqPassword,
        encryptedPassword
      );

      if (comparePassword) {
        if (user["account_status"] === "1") {
          const loginId = uniqid();
          const credential = user;

          credential["login_id"] = loginId;
          credential["login_mode"] = "0";
          credential["impersonate_uid"] = "";
          credential["login_at"] = d.getTime();
          credential["expired_at"] = d.getTime() + 86400000;
          credential["browser_id"] = req.headers["user-agent"];
          delete credential["password"];

          const jsonData = JSON.stringify(credential);

          // create session file
          fs.writeFile(
            `./sessions/${credential["login_id"]}.json`,
            jsonData,
            (err) => {
              console.log(err);
            }
          );

          const jwtData = {
            login_id: loginId,
            expired_at: credential["expired_at"]
          };

          const jwtToken = jwt.sign(jwtData, process.env.SECRET_KEY);

          // input login log
          const loginLog = {
            login_id: uniqid(),
            uid: usernames[0].uid,
            activity: "1",
            created_at: d.getTime()
          };

          await insertLoginLog(loginLog);

          res.status(200).json({
            message: "Login Success",
            data: jwtToken
          });
        } else {
          errData["password"] = "Your account is inactive";

          res.status(404).json({
            messgae: "Login Failed",
            errors: errData
          });
        }
      } else {
        errData["password"] = "The password you entered is incorrect";

        res.status(404).json({
          messgae: "Login Failed",
          errors: errData
        });
      }
    }
  } else {
    res.status(400).json({
      messgae: "Login Failed",
      errors: errData
    });
  }
};

const postLogutUser = async (req, res) => {
  const reqData = req.body;
  const token = reqData.id;
  const secretOrPublicKey = process.env.SECRET_KEY;

  // verify user token id
  jwt.verify(token, secretOrPublicKey, (err, decoded) => {
    if (err) {
      res.status(401).json({
        message: "Logout Failed, User Id is not valid"
      });
    } else {
      const credentials = decoded;

      // remove session file
      fs.unlink(`./sessions/${credentials.login_id}.json`, (err) => {
        //   ********************* response ********************* //
        if (err) {
          res.status(500).json({
            message: "Logout Failed"
          });
        } else {
          res.status(200).json({
            message: "Logout Success"
          });
        }
      });
    }
  });
};

const postGetSessionData = (req, res) => {
  const reqData = req.body;
  const token = reqData.id;
  const secretOrPublicKey = process.env.SECRET_KEY;

  jwt.verify(token, secretOrPublicKey, (err, decoded) => {
    if (err) {
      res.status(404).json({
        message: "Your id is invalid"
      });
    } else {
      const credentials = decoded;

      fs.readFile(
        `./sessions/${credentials["login_id"]}.json`,
        "utf8",
        (err, data) => {
          if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({
              message: "Your session is not found"
            });
            return;
          }
          try {
            const jsonData = JSON.parse(data);
            jsonData.dark_mode = jsonData.dark_mode === 0 ? false : true;
            res.status(200).json({
              message: "Get session success",
              data: jsonData
            });
          } catch (error) {
            res.status(500).json({
              message: "Failed to parse JSON"
            });
          }
        }
      );
    }
  });
};

const postOTP = async (req, res) => {
  const uid = req.params.uid;
  const d = new Date();
  const otpData = await selectOtpByUid(uid);
  const userData = await selectUsersBy(`uid='${uid}'`);
  const dataToSave = {
    otp: Math.floor(100000 + Math.random() * 900000),
    expired: d.getTime() + 1800000
  };

  const whatsappMessage = `
    *PERMINTAAN PERUBAHAN PASSWORD*

    Halo, Anda telah mengirimkan permintaan perubah password berikut adalah kode OTP untuk mengubah password Anda.

    *OTP : ${dataToSave.otp}*

    _Kode diatas berlaku selama 30 menit_
    `;

  if (userData.length !== 0) {
    if (otpData.length === 0) {
      dataToSave.uid = uid;
      dataToSave.oid = uniqid();

      const queryResult = await insertOtp(dataToSave);

      if (queryResult) {
        whatsappSender(userData[0]["phone"], whatsappMessage);
        res.status(200).json({
          message: "OTP Created"
        });
      } else {
        res.status(500).json({
          message: "Failed to send OTP"
        });
      }
    } else {
      const queryResult = await updateOtp(dataToSave, uid);

      if (queryResult) {
        whatsappSender(userData[0]["phone"], whatsappMessage);

        res.status(200).json({
          message: "OTP Created"
        });
      } else {
        res.status(500).json({
          message: "Failed to send OTP"
        });
      }
    }
  } else {
    res.status(404).json({
      message: "User Not Found"
    });
  }
};

// ========================================== GET  ========================================== //

const getLoginLogBy = async (req, res) => {
  const filter = req.params.filter;
  const data = await selectLoginLogBy(filter);

  res.status(200).json({
    message: "Success",
    data: data
  });
};

const getVerifyOtp = async (req, res) => {
  const d = new Date();
  const uid = req.params.uid;
  const otp = parseInt(req.params.otp);
  const otpData = await selectOtpByUid(uid);

  if (otpData.length > 0) {
    if (otpData[0]["otp"] === otp && otpData[0]["expired"] > d.getTime()) {
      res.status(200).json({
        message: "Success",
        data: otpData[0]["oid"]
      });
    } else {
      res.status(400).json({
        message: "Your OTP is invalid"
      });
    }
  } else {
    res.status(404).json({
      message: "OTP not found"
    });
  }
};

const getOtpByOid = async (req, res) => {
  const oid = req.params.oid;
  const data = await selectOtpByOid(oid);

  res.status(200).json({
    message: "Success",
    data: data
  });
};

const getAddVisitor = async (req, res) => {
  const domain = req.headers.origin;
  const d = new Date();
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  if (domain == "http://localhost:3000") {
    selectVisitorBy(
      `day='${day}' and month='${month}' and year='${year}'`
    ).then((visData) => {
      const today = visData;
      if (today.length == 0) {
        const dataToInsert = {
          vid: uniqid(),
          day: day,
          month: month,
          year: year,
          count: 1,
          created_at: d.getTime()
        };

        insertVisitor(dataToInsert);
      } else {
        const dataToUpdate = {
          day: day,
          month: month,
          year: year,
          count: parseInt(visData[0]["count"]) + 1
        };

        updateVisitors(dataToUpdate, visData[0]["vid"]);
      }
    });
    res.status(200).json({
      message: "Success"
    });
  } else {
    res.status(403).json({
      message: "Visitor Tidak ditambahkan"
    });
  }
};

const getVisitorData = async (req, res) => {
  const d = new Date();
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  console.log(day, month, year);

  const dataVisitor = (await selectVisitorBy(`vid like '%%'`)).sort(
    (a, b) => b.created_at - a.created_at
  );

  const todayVisitor = dataVisitor.filter(
    (i) => i.day == day && i.month == month && i.year == year
  );

  const monthVisitorArray = dataVisitor.filter(
    (i) => i.month == month && i.year == year
  );

  var monthVisitor = 0;

  monthVisitorArray.forEach((i) => {
    monthVisitor += parseInt(i.count);
  });

  const yearVisitorArray = dataVisitor.filter((i) => i.year == year);

  var yearVisitor = 0;

  yearVisitorArray.forEach((i) => {
    yearVisitor += parseInt(i.count);
  });

  const lastTenDaysVisitor = [];

  const dataVisitorResume = {
    today: todayVisitor[0]["count"],
    this_month: monthVisitor,
    this_year: yearVisitor,
    last_ten_day: dataVisitor.slice(0, 10)
  };

  res.status(200).json({
    message: "Success",
    data: dataVisitorResume
  });
};

// ========================================== PUT  ========================================== //

const putUpdateSession = async (req, res) => {
  const reqData = req.body;
  const token = reqData.id;
  const secretOrPublicKey = process.env.SECRET_KEY;

  jwt.verify(token, secretOrPublicKey, (err, decoded) => {
    if (err) {
      res.status(404).json({
        message: "Your id is invalid"
      });
    } else {
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
            console.log(jsonData);
            var userData;

            userData = await selectUsersBy(`uid='${jsonData.uid}'`);

            if (reqData.login_mode === undefined && reqData.uid === undefined) {
              userData = await selectUsersBy(`uid='${jsonData.uid}'`);
            } else {
              userData = await selectUsersBy(`uid='${reqData.uid}'`);
              if (reqData.login_mode === "1") {
                jsonData["login_mode"] = reqData["login_mode"];
                jsonData["impersonate_uid"] = jsonData["uid"];
                jsonData["uid"] = reqData["uid"];
              } else {
                jsonData["login_mode"] = reqData["login_mode"];
                jsonData["impersonate_uid"] = "";
                jsonData["uid"] = reqData["uid"];
              }
            }

            jsonData["full_name"] = userData[0]["full_name"];
            jsonData["username"] = userData[0]["username"];
            jsonData["level_id"] = userData[0]["level_id"];
            jsonData["phone"] = userData[0]["phone"];
            jsonData["email"] = userData[0]["email"];
            jsonData["address"] = userData[0]["address"];
            jsonData["gender"] = userData[0]["gender"];
            jsonData["account_status"] = userData[0]["account_status"];
            jsonData["profile_picture"] = userData[0]["profile_picture"];
            jsonData["dark_mode"] = userData[0]["dark_mode"];

            const jsonDataUpdate = JSON.stringify(jsonData);

            fs.writeFile(
              `./sessions/${jsonData["login_id"]}.json`,
              jsonDataUpdate,
              (err) => {
                console.log(err);
              }
            );

            res.status(200).json({
              message: "Update session success"
            });
          } catch (error) {
            res.status(500).json({
              message: "Failed to parse JSON"
            });
          }
        }
      );
    }
  });
};

const putUpdatePassword = async (req, res, next) => {
  const uid = req.params.uid;
  const reqData = req.body;

  if (reqData.password === reqData.password_confirm) {
    const userData = await selectUsersBy(`uid='${uid}'`);

    if (userData.length > 0) {
      if (strMinLength(reqData["password"], 6)) {
        const salt = bcrypt.genSaltSync(10);
        reqData["password"] = bcrypt.hashSync(reqData["password"], salt);
        delete reqData["password_confirm"];
        const queryResult = await updateUser(reqData, uid);

        if (queryResult) {
          res.status(200).json({
            message: "Success"
          });
        } else {
          res.status(200).json({
            message: "Internal server error"
          });
        }
      } else {
        res.status(400).json({
          message: "Password length less than 6 character"
        });
      }
    } else {
      res.status(404).json({
        message: "Account not found"
      });
    }
  } else {
    res.status(400).json({
      message: "Your password does not match woth password confirmation"
    });
  }
};

// ========================================== DELETE  ========================================== //

export {
  getVerifyOtp,
  getLoginLogBy,
  getOtpByOid,
  getAddVisitor,
  postCreateAccount,
  postLoginUser,
  postLogutUser,
  postOTP,
  postGetSessionData,
  putUpdateSession,
  putUpdatePassword,
  getVisitorData
};
