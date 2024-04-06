import { db, mysqldb } from "../configs/database.js";

// ======================== SELECT  ======================== //
const selectUserAll = async (filter) => {
  const query = `select users.*, master_level_id.name as level_name from users inner join master_level_id on users.level_id = master_level_id.level_id where ${filter} order by users.full_name asc`;

  var result = await db
    .promise()
    .query(query)
    .then(([rows, err]) => {
      return rows;
    });

  return result;
};

const selectAllDataUsers = async () => {
  const query = `select users.*, master_level_id.name as level_name from users inner join master_level_id on users.level_id = master_level_id.level_id`;

  var result = await db
    .promise()
    .query(query)
    .then(([rows, err]) => {
      return rows;
    });

  return result;
};

const selectTotalUserPage = async (limit) => {
  const query = `select ceil(COUNT(*) / ${limit}) as page_count from users`;

  var result = await db
    .promise()
    .query(query)
    .then(([rows, err]) => {
      return rows[0]["page_count"];
    });

  return result;
};

const selectTotalUserCount = async () => {
  const query = `select COUNT(*) as page_count from users`;

  var result = await db
    .promise()
    .query(query)
    .then(([rows, err]) => {
      return rows[0]["page_count"];
    });

  return result;
};

const selectUsersBy = async (filter) => {
  const query = await mysqldb
    .select("users.*", "master_level_id.name as level_name")
    .from("users")
    .innerJoin("master_level_id", "users.level_id", "master_level_id.level_id")
    .where(mysqldb.raw(filter));

  return query;

  // ========================= UPDATE ========================= //
};

// ======================== UPDATE  ======================== //

const updateUser = async (data, id) => {
  const updateData = await mysqldb("users").where(`uid`, id).update(data);

  return updateData == 1 ? true : false;
};

export {
  selectUserAll,
  selectTotalUserPage,
  selectTotalUserCount,
  selectAllDataUsers,
  selectUsersBy,
  updateUser
};
