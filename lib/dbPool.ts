
import mysql from "mysql2/promise";

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

const db =
  global.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = db;
}

export default db;
