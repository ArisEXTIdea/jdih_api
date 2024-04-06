import {
  deleteNotif,
  deleteNotifAll,
  insertNotification,
  selectNotifAllByNid,
  selectNotifAllByUid,
  selectNotifAllByUidCount,
  updateNotif,
  updateNotifReadAll,
} from "../models/notification_m.js";
import whatsappSender from "../utils/whatssap.js";
import uniqid from "uniqid";

// ================================= GET ================================= //

const getAllNotifPagination = async (req, res) => {
  const limit = 30;
  const page = (req.params.page - 1) * limit;
  const uid = req.params.uid;

  const data = await selectNotifAllByUid(uid);
  const totalPage = Math.ceil(data.length / limit);

  res.status(200).json({
    message: "Success",
    data: data.slice(page, limit * req.params.page),
    totalPage: totalPage === 0 ? 1 : totalPage,
    totalUser: data.length,
  });
};

const getIsReadNotif = async (req, res) => {
  const uid = req.params.uid;

  const data = await selectNotifAllByUidCount(uid);

  res.status(200).json({
    message: "Success",
    total: data.length,
  });
};

// ================================= POST ================================= //
const postNotification = (req, res) => {
  const reqData = req.body;
  const d = new Date();
  const dataToSave = reqData;
  reqData.created_at = d.getTime();
  reqData.is_read = 0;
  reqData.nid = uniqid();
  reqData.content = reqData["content"]
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\//g, "\\/");
  reqData.short_desc = reqData["short_desc"]
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\//g, "\\/");

  const whatsappMessage = `
  *${reqData.header}*
  
  ${reqData.content}
  
  _Pesan ini dikirim otomatis oleh sistem untuk informasi lebih lanjut silakan hubungi Sdr. *Suparjo - 62895371849899*_

  _*EXTCMS*_
  `;

  // const resQuery = await insertNotification(dataToSave);

  insertNotification(dataToSave).then((result) => {
    if (result) {
      whatsappSender("62895371849899", whatsappMessage);

      res.status(201).json({
        message: "Success to create notification",
      });
    } else {
      res.status(500).json({
        message: "There is error in your SQL Query",
      });
    }
  });
};

// ================================= PUT ================================= //

const putNotif = async (req, res) => {
  const nid = req.params.nid;
  const reqData = req.body;

  const dataToUpdate = reqData;

  const queryRes = await updateNotif(dataToUpdate, nid);

  if (queryRes) {
    res.status(200).json({
      message: "Success",
    });
  } else {
    res.status(500).json({
      message: "there is error in your SQL Query",
    });
  }
};

const putNotifReadAll = async (req, res) => {
  const uid = req.params.uid;
  const reqData = req.body;

  const dataToUpdate = reqData;

  const queryRes = await updateNotifReadAll(dataToUpdate, uid);

  if (queryRes) {
    res.status(200).json({
      message: "Success",
    });
  } else {
    res.status(500).json({
      message: "there is error in your SQL Query",
    });
  }
};

// ================================= DELETE ================================= //

const deleteRemoveNotif = async (req, res) => {
  const nid = req.params.nid;

  // check if id is exist
  const checkIdIsRegistered = await selectNotifAllByNid(nid);

  if (checkIdIsRegistered.length > 0) {
    const queryRes = await deleteNotif(nid);

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
      message: "Your notification is not found",
    });
  }
};

const deleteRemoveNotifAll = async (req, res) => {
  const uid = req.params.uid;

  const queryRes = await deleteNotifAll(uid);

  if (!queryRes) {
    res.status(200).json({
      message: "Success to delete notification",
    });
  } else {
    res.status(500).json({
      message: "Failed to delete notification",
    });
  }
};

export {
  postNotification,
  getAllNotifPagination,
  getIsReadNotif,
  putNotif,
  putNotifReadAll,
  deleteRemoveNotif,
  deleteRemoveNotifAll,
};
