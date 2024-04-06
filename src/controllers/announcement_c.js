import sharp from "sharp";
import uniqid from "uniqid";
import {
  capitalizeEachWord,
  escapeSpecialCharacters,
  handleResizeFile,
} from "../utils/global_function.js";
import fs, { unlink } from "fs";
import {
  fieldFileExtensionIsAllowed,
  fieldFileIsEmpty,
  fieldIsEmpty,
} from "../utils/validation.js";
import { fileExtensions } from "../utils/global_variable.js";
import {
  deleteAnnouncementById,
  insertAnnouncement,
  selectAllAnnouncement,
  selectAnnouncementBy,
  updateAnnouncementId,
} from "../models/announcement_m.js";

// ============================ POST ============================ //
const postNewAnnouncement = async (req, res) => {
  const d = new Date();
  // variable
  const reqData = req.body;
  const fileData = req.files;
  const reqDataField = Object.keys(reqData);
  const errData = {};

  // ************** Validation ************** //

  // check if reqdata is not empty
  reqDataField.map((i) => {
    if (fieldIsEmpty(reqData[i])) {
      errData[i] = "Please complete this field";
    }
  });

  // check if filedata is not empty

  if (fieldFileIsEmpty(fileData, "banner")) {
    errData["banner"] = "Please upload banner file";
  } else {
    const file = fileData["banner"][0];
    const fileExtension = file["filename"].split(".").reverse()[0];

    // check file extension
    if (!fieldFileExtensionIsAllowed(fileExtensions["Images"], fileExtension)) {
      errData["banner"] = "Your file is not supported";
    } else {
      // compress file
      if (Object.keys(errData).length === 0) {
        handleResizeFile(
          fileData["banner"][0].filename,
          0,
          fileData["banner"][0].size
        );
      }
    }
  }

  if (Object.keys(errData).length === 0) {
    // complete data to save
    const dataToSave = reqData;
    dataToSave.aid = uniqid();
    dataToSave.created_at = d.getTime();
    dataToSave.banner = fileData["banner"][0].filename;
    dataToSave.short_info = escapeSpecialCharacters(reqData.short_info);

    // ************** RESPONSE ************** //

    // save data to database and send a response
    insertAnnouncement(dataToSave)
      .then((result) => {
        res.status(200).json({
          message: "Success to create announcement",
        });
      })
      .catch((err) => {
        fs.unlinkSync(`./uploads/images/${fileData["banner"][0].filename}`);
        res.status(500).json({
          message: "Internal server error",
        });
      });
  } else {
    if (fileData.banner !== undefined) {
      fs.unlinkSync(`./uploads/images/${fileData["banner"][0].filename}`);
    }

    res.status(400).json({
      message: "Form Validation Error",
      data: errData,
    });
  }
};

// ============================ GET ============================ //

const getDataAnnouncementAll = (req, res) => {
  selectAllAnnouncement()
    .then((result) => {
      res.status(200).json({
        message: "Success",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Internal server error",
      });
    });
};

const getDataAnnouncementByAid = (req, res) => {
  const aid = req.params.aid;
  console.log(aid);
  selectAnnouncementBy(`aid='${aid}'`)
    .then((result) => {
      res.status(200).json({
        message: "Success",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Internal server error",
      });
    });
};

const getAllAnnouncementPagination = (req, res) => {
  const limit = 15;
  const page = (req.params.page - 1) * limit;

  const data = selectAllAnnouncement().then((result) => {
    const totalPage = Math.ceil(result.length / limit);

    res.status(200).json({
      message: "Success",
      data: result.slice(page, limit * req.params.page),
      totalPage: totalPage === 0 ? 1 : totalPage,
      totalUser: data.length,
    });
  });
};

// ============================ UPDATE ============================ //
const putDataAnnouncement = (req, res) => {
  // variable
  const aid = req.params.aid;
  const reqData = req.body;
  const fileData = req.files;
  const reqDataField = Object.keys(reqData);
  const errData = {};

  // ************** Validation ************** //

  selectAnnouncementBy(`aid='${aid}'`).then((result) => {
    if (result.length > 0) {
      reqDataField.map((i) => {
        if (fieldIsEmpty(reqData[i])) {
          errData[i] = "Please complete this field";
        }
      });

      // check if filedata is not empty

      if (!fieldFileIsEmpty(fileData, "banner")) {
        const file = fileData["banner"][0];
        const fileExtension = file["filename"].split(".").reverse()[0];

        // check file extension
        if (
          !fieldFileExtensionIsAllowed(fileExtensions["Images"], fileExtension)
        ) {
          errData["banner"] = "Your file is not supported";
        } else {
          // compress file
          handleResizeFile(fileData["banner"][0].filename, 0);
        }
        reqData["banner"] = fileData["banner"][0].filename;
      }

      if (Object.keys(errData).length === 0) {
        // complete data to save
        const dataToSave = reqData;
        if (reqDataField.includes("short_info")) {
          reqData.short_info = escapeSpecialCharacters(reqData.short_info);
        }

        // ************** RESPONSE ************** //

        // save data to database and send a response
        updateAnnouncementId(dataToSave, aid)
          .then((result2) => {
            if (!fieldFileIsEmpty(fileData, "banner")) {
              fs.unlinkSync(`./uploads/images/${result[0]["banner"]}`);
            }
            res.status(200).json({
              message: "Success to update announcement",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              message: "Internal server error",
            });
          });
      } else {
        res.status(400).json({
          message: "Form Validation Error",
          data: errData,
        });
      }
    } else {
      res.status(404).json({
        message: "Announcement not found",
      });
    }
  });
};

// ============================ DELETE ============================ //

const deleteDataAnnouncement = (req, res) => {
  const aid = req.params.aid;
  selectAnnouncementBy(`aid='${aid}'`)
    .then((result) => {
      if (result.length > 0) {
        deleteAnnouncementById(aid)
          .then((result2) => {
            fs.unlinkSync(`./uploads/images/${result[0]["banner"]}`);
            res.status(200).json({
              message: "Success",
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Internal server error",
            });
          });
      } else {
        res.status(404).json({
          message: "Announcement not found",
        });
      }
    })
    .catch((err) => console.log(err));
};

export {
  postNewAnnouncement,
  getDataAnnouncementAll,
  getDataAnnouncementByAid,
  getAllAnnouncementPagination,
  putDataAnnouncement,
  deleteDataAnnouncement,
};
