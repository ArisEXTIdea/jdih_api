import { db, mysqldb } from "../configs/database.js";

// ============================== SELECT ============================== //
const selectVisitorDayBy = async () => {
  const query = `select * from master_visitors order by day desc`;

  var result = await db
    .promise()
    .query(query)
    .then(([rows, err]) => {
      return rows;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return result;
};

// ============================== INSERT ============================== //
// ============================== UPDATE ============================== //
// ============================== DELETE ============================== //

export { selectVisitorDayBy };
