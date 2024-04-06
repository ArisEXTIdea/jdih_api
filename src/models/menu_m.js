// ======================== SELECT  ======================== //

import { db, mysqldb } from "../configs/database.js";

const selectMenuAll = async () => {
  const query = await mysqldb.select("*").from("master_menu");

  return query;
};

const selectMenuBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_menu")
    .where(mysqldb.raw(filter));

  return query;
};

const selectGroupMenuAll = async () => {
  const query = await mysqldb.select("*").from("master_menu_group");

  return query;
};

const selectMenuGroupBy = async (filter) => {
  const query = await mysqldb
    .select("*")
    .from("master_menu_group")
    .where(mysqldb.raw(filter));

  return query;
};

// ======================== INSERT  ======================== //

const insertMenu = async (data) => {
  return mysqldb("master_menu")
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

const insertGroupMenu = async (data) => {
  return mysqldb("master_menu_group")
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

// ======================== UPDATE  ======================== //

const updateMenuGroup = async (data, id) => {
  const updateData = await mysqldb("master_menu_group")
    .where(`mgid`, id)
    .update(data);

  return updateData == 1 ? true : false;
};

const updateMenu = async (data, id) => {
  const updateData = await mysqldb("master_menu").where(`mid`, id).update(data);

  return updateData == 1 ? true : false;
};

// ======================== DELETE  ======================== //

const deleteGroupMenu = async (id) => {
  const query = await mysqldb("master_menu_group").where("mgid", id).del();
  return query == 1 ? true : false;
};

const deleteMenu = async (id) => {
  const query = await mysqldb("master_menu").where("mid", id).del();
  return query == 1 ? true : false;
};

export {
  insertMenu,
  selectMenuBy,
  insertGroupMenu,
  selectGroupMenuAll,
  selectMenuGroupBy,
  updateMenuGroup,
  updateMenu,
  deleteGroupMenu,
  deleteMenu,
  selectMenuAll,
};
