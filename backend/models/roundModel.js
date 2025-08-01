const pool = require('../config/db');

// 라운드 생성
async function createRound(userId, courseName, date, weather = '-') {
  const [result] = await pool.query(
    `INSERT INTO rounds (user_id, course_name, date, weather)
     VALUES (?, ?, ?, ?)`,
    [userId, courseName, date, weather]
  );
  return result.insertId;  // 새로 생긴 round.id
}

// 특정 유저의 모든 라운드 가져오기
async function getRoundsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM rounds
     WHERE user_id = ?
     ORDER BY date DESC`,
    [userId]
  );
  return rows;
}

// 라운드 상세 (하나만)
async function getRoundById(roundId) {
  const [rows] = await pool.query(
    `SELECT * FROM rounds WHERE id = ?`,
    [roundId]
  );
  return rows[0] || null;
}

// 라운드 삭제 (연관된 holes, shots도 cascade로 삭제)
async function deleteRound(roundId) {
  // shots → holes → rounds 순서로 지워야 FK 제약에 걸리지 않아요
  await pool.query(
    `DELETE s FROM shots s
     JOIN holes h ON s.hole_id = h.id
     WHERE h.round_id = ?`,
    [roundId]
  );
  await pool.query(
    `DELETE FROM holes WHERE round_id = ?`,
    [roundId]
  );
  const [result] = await pool.query(
    `DELETE FROM rounds WHERE id = ?`,
    [roundId]
  );
  return result.affectedRows;  // 삭제된 행 수
}

module.exports = {
  createRound,
  getRoundsByUser,
  getRoundById,
  deleteRound
};
