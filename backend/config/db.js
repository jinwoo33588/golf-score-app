const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: +process.env.DB_CONN_LIMIT || 10,
  timezone: process.env.DB_TIMEZONE || 'Z', // 'Z' = UTC
  // dateStrings: true, // 날짜를 문자열로 받고 싶으면 주석 해제
});

module.exports = pool;
