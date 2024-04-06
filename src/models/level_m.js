import { mysqldb } from "../configs/database.js";

// ======================== SELECT  ======================== //

const insertLevel = async (data) => {
  return mysqldb("master_level_id")
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

const selectAllLevel = async () => {
  const query = await mysqldb.select("*").from("master_level_id");

  return query;
};

const selectLevelBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_level_id")
    .where(mysqldb.raw(filter));

  return query;
};

// ======================== UPDATE  ======================== //

const updateLevelId = async (data, id) => {
  const updateData = await mysqldb("master_level_id")
    .where(`level_id`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

// ======================== DELETE  ======================== //
const deleteLevelById = async (id) => {
  const query = await mysqldb("master_level_id").where("level_id", id).del();
  return query == 1 ? true : false;
};

export {
  insertLevel,
  selectAllLevel,
  selectLevelBy,
  updateLevelId,
  deleteLevelById
};
