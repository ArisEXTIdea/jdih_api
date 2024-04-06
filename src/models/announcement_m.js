import { mysqldb } from "../configs/database.js";

// ==================== INSERT ==================== //

const insertAnnouncement = async (data) => {
  return mysqldb("master_announcement")
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

const selectAllAnnouncement = async () => {
  const query = await mysqldb.select("*").from("master_announcement");

  return query;
};

const selectAnnouncementBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_announcement")
    .where(mysqldb.raw(filter));

  return query;
};

// ======================== UPDATE  ======================== //

const updateAnnouncementId = async (data, id) => {
  const updateData = await mysqldb("master_announcement")
    .where(`aid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};
// ======================== DELETE  ======================== //
const deleteAnnouncementById = async (id) => {
  const query = await mysqldb("master_announcement").where("aid", id).del();
  return query == 1 ? true : false;
};

export {
  insertAnnouncement,
  selectAllAnnouncement,
  selectAnnouncementBy,
  updateAnnouncementId,
  deleteAnnouncementById,
};
