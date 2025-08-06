// backend/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,     // .env에 설정하세요
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,          // 커넥션이 부족하면 대기
  connectionLimit: 10,               // 최대 커넥션 수
  queueLimit: 0
});

module.exports = pool;
