const mariadb = require("mariadb");

require("dotenv").config();
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  decimalAsNumber: true,
  bigIntAsNumber: true,
  connectionLimit: 5
});

query = async (sql, args) => {
  const conn = await pool.getConnection();
  const result = await conn.query(sql, args);
  conn.release();
  return result;
};

module.exports = { query };