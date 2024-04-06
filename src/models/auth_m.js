import { mysqldb } from "../configs/database.js";

// ==================== SELECT ==================== //
const selectUsersBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("users")
    .where(mysqldb.raw(filter));

  return query;
};

const selectOtpByUid = async (uid) => {
  const query = await mysqldb.select("*").from("master_otp").where("uid", uid);

  return query;
};

const selectOtpByOid = async (oid) => {
  const query = await mysqldb.select("*").from("master_otp").where("oid", oid);

  return query;
};

const selectLoginLogBy = async (filter) => {
  const query = await mysqldb
    .select(
      "master_login_log.login_id",
      "master_login_log.uid",
      "master_login_log.created_at",
      "users.full_name",
      "users.level_id",
      "users.profile_picture"
    )
    .from("master_login_log")
    .innerJoin("users", "users.uid", "master_login_log.uid")
    .where(mysqldb.raw(filter));

  return query;
};

const selectVisitorBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_visitors")
    .where(mysqldb.raw(filter));

  return query;
};
// ==================== INSERT ==================== //

const insertUser = async (data) => {
  return mysqldb("users")
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

const insertOtp = async (data) => {
  return mysqldb("master_otp")
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

const insertLoginLog = async (data) => {
  return mysqldb("master_login_log")
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

const insertVisitor = async (data) => {
  return mysqldb("master_visitors")
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

// ==================== UPDATE ==================== //

const updateOtp = async (data, id) => {
  const updateData = await mysqldb("master_otp").where(`uid`, id).update(data);

  return updateData == 1 ? true : false;
};

const updateVisitors = async (data, id) => {
  const updateData = await mysqldb("master_visitors")
    .where(`vid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

// ==================== DELETE ==================== //

export {
  selectUsersBy,
  insertUser,
  insertLoginLog,
  insertVisitor,
  selectLoginLogBy,
  selectOtpByUid,
  updateOtp,
  updateVisitors,
  insertOtp,
  selectOtpByOid,
  selectVisitorBy
};
