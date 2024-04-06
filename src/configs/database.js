import mysql from "mysql2";
import dotenv from "dotenv";
import knex from "knex";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true
});

const mysqldb = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
  }
});

const jdihdb = knex({
  client: "mysql2",
  connection: {
    host: "jdih.jepara.go.id",
    user: "c9jdihnew_db",
    database: "c9jdihnew_db",
    password: "ndkdzGCQE_Q86",
    port: 53366
  }
});

//  database.default.hostname = localhost;
//  database.default.database = c9jdihnew_db;
//  database.default.username = c9jdihnew_db;
//  database.default.password = ndkdzGCQE_Q86;
//  database.default.DBDriver = MySQLi;
//  database.default.DBPrefix = database.default.port = 3306;

export { db, mysqldb, jdihdb };
