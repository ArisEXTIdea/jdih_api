import { mysqldb } from "../configs/database.js";

// ======================== INSERT  ======================== //

const insertNewWebSetting = async (data) => {
  return mysqldb("master_web_setting")
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

// ======================== SELECT  ======================== //

const selectAllSetting = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_web_setting")
    .where(mysqldb.raw(filter));

  return query;
};

const selectAllSettingNoPage = async () => {
  const query = await mysqldb.select("*").from("master_web_setting");

  return query;
};

// ======================== UPDATE  ======================== //

const updateSettingBySid = async (data, id) => {
  const updateData = await mysqldb("master_web_setting")
    .where(`sid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

// ======================== DELETE  ======================== //

const deleteSettingBySid = async (id) => {
  const query = await mysqldb("master_web_setting").where("sid", id).del();
  return query == 1 ? true : false;
};

export {
  insertNewWebSetting,
  selectAllSetting,
  selectAllSettingNoPage,
  deleteSettingBySid,
  updateSettingBySid,
};
