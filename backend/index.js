require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
}

const app = require('./app');
const { pool } = require('./config/db');

(async () => {
  try {
    // (선택) DB 연결 점검
    const conn = await pool.getConnection();
    conn.release();

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✅ Backend on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('DB connection failed:', e);
    process.exit(1);
  }
})();
