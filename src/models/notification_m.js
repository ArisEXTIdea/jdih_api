import { db, mysqldb } from "../configs/database.js";

// ==================== INSERT ==================== //

const insertNotification = async (data) => {
  return mysqldb("notification")
    .insert(data)
    .then((result) => {
      if (result.rowCount > 0) {
        return false;
      } else {
        return true;
      }
    })
    .catch((error) => {
      return false;
    });
};

// ==================== SELECT ==================== //
const selectNotifAllByUid = async (uid) => {
  const query = await mysqldb
    .select(
      "notification.*",
      "users.full_name",
      "users.level_id",
      "users.profile_picture"
    )
    .from("notification")
    .innerJoin("users", "users.uid", "notification.uid")
    .where("notification.uid", uid)
    .orderBy("notification.created_at", "desc");

  return query;
};

const selectNotifAllByUidCount = async (uid) => {
  const query = await mysqldb
    .select("*")
    .from("notification")
    .where("notification.uid", uid)
    .andWhere("notification.is_read", "0")
    .orderBy("notification.created_at", "desc");

  return query;
};

const selectNotifAllByNid = async (nid) => {
  const query = await mysqldb
    .select(
      "notification.*",
      "users.full_name",
      "users.level_id",
      "users.profile_picture"
    )
    .from("notification")
    .innerJoin("users", "users.uid", "notification.uid_sender")
    .where("notification.nid", nid)
    .orderBy("notification.created_at", "desc");

  return query;
};

// ==================== UPDATE ==================== //

const updateNotif = async (data, id) => {
  const updateData = await mysqldb("notification")
    .where(`nid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

const updateNotifReadAll = async (data, id) => {
  const updateData = await mysqldb("notification")
    .where(`uid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

// ==================== DELETE ==================== //

const deleteNotif = async (id) => {
  const query = await mysqldb("notification").where("nid", id).del();
  return query == 1 ? true : false;
};

const deleteNotifAll = async (id) => {
  const query = await mysqldb("notification").where("uid", id).del();
  return query == 1 ? true : false;
};

export {
  insertNotification,
  selectNotifAllByUid,
  updateNotif,
  updateNotifReadAll,
  deleteNotif,
  deleteNotifAll,
  selectNotifAllByNid,
  selectNotifAllByUidCount,
};
