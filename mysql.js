const mariadb = require("mariadb");

require("dotenv").config();
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  decimalAsNumber: true,
  connectionLimit: 5
});

query = async (sql, args) => {
  const conn = await pool.getConnection();
  const result = await conn.query(sql, args);
  conn.release();

  // Convert safe BigInts to Numbers and unsafe BigInts to Strings
  for (let i = 0; i < result.length; i++) {
    const row = result[i];
    for (const key in row) {
      const value = row[key];
      if (typeof value === "bigint") {
        if (value > Number.MAX_SAFE_INTEGER) {
          row[key] = value.toString();
        } else {
          row[key] = Number(value);
        }
      }
    }
  }

  return result;
};

module.exports = { query };