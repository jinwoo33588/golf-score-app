// backend/scripts/preflight.js
// CommonJS 기준
require('dotenv').config();
const path = require('path');

// ────────────────────────────────────────────────────────────────
// A. 환경변수 점검
// ────────────────────────────────────────────────────────────────
function checkEnv() {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const optional = ['PORT', 'DB_PORT', 'DB_CONN_LIMIT', 'DB_TIMEZONE'];

  let ok = true;
  for (const k of required) {
    if (!process.env[k] || String(process.env[k]).trim() === '') {
      console.error(`❌ Missing env: ${k}`);
      ok = false;
    }
  }

  // 경고(실패는 아님)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('⚠️  JWT_SECRET is quite short. Consider a 32+ char random string.');
  }
  if (!process.env.DB_TIMEZONE) {
    console.warn('⚠️  DB_TIMEZONE not set. Using driver default (recommend: Z for UTC).');
  }

  if (!ok) {
    console.error('\n➡️  Fix the missing env vars in backend/.env and retry.');
    process.exit(1);
  } else {
    console.log('✅ Env check passed.');
  }
}

// ────────────────────────────────────────────────────────────────
// B. 의존성 점검 (require.resolve로 존재 여부 확인)
// ────────────────────────────────────────────────────────────────
function checkDeps() {
  // 프로젝트에서 실제 사용하는 패키지들로 맞춤
  const required = [
    'express',
    'cors',
    'dotenv',
    'mysql2',
    'bcrypt',
    'jsonwebtoken',
    // 개발용
    'nodemon'
  ];
  let ok = true;
  for (const name of required) {
    try {
      require.resolve(name);
    } catch {
      console.error(`❌ Missing dependency: ${name}`);
      ok = false;
    }
  }
  if (!ok) {
    console.error('\n➡️  Run in backend/: npm i');
    process.exit(1);
  } else {
    console.log('✅ Dependency check passed.');
  }
}

// ────────────────────────────────────────────────────────────────
// C. DB 연결 점검 (간단 쿼리)
// ────────────────────────────────────────────────────────────────
async function checkDb() {
  try {
    // config/db.js를 재사용 (pool export 가정)
    const { pool } = require('../config/db');
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT 1 AS ok');
      if (!rows || !rows[0] || rows[0].ok !== 1) {
        throw new Error('SELECT 1 failed');
      }
      console.log('✅ DB check passed (SELECT 1).');
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
    console.error('   Check DB_HOST/USER/PASSWORD/NAME (and DB_PORT), and MySQL is running.');
    process.exit(1);
  }
}

// ────────────────────────────────────────────────────────────────
// D. 메인 실행
// ────────────────────────────────────────────────────────────────
(async function main() {
  try {
    // 실행 위치 확인(혼동 방지)
    const cwd = process.cwd();
    const expect = path.resolve(__dirname, '..'); // backend/
    if (cwd !== expect) {
      console.warn(`⚠️  Run this script from "backend/" (current: ${cwd})`);
    }

    checkEnv();
    checkDeps();
    await checkDb();

    console.log('🎉 Preflight checks: ALL GREEN');
  } catch (e) {
    console.error('Unexpected error in preflight:', e);
    process.exit(1);
  }
})();
