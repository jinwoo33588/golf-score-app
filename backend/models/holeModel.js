// backend/models/holeModel.js
const pool = require('../config/db');

// 여러 홀을 한 번에 생성
// holesData = [{ hole_number, par, score, putts, gir, fir, penalties }, …]
async function createHoles(roundId, holesData) {
  const values = holesData.map(h => [
    roundId,
    h.hole_number,
    h.par,
    h.score    ?? null,
    h.putts    ?? null,
    h.gir ? 1 : 0,
    h.fir   ? 1 : 0,
    h.penalties ?? 0
  ]);
  const [result] = await pool.query(
    `INSERT INTO holes
     (round_id, hole_number, par, score, putts, gir, fir, penalties)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

// 라운드의 모든 홀 불러오기
async function getHolesByRound(roundId) {
  const [rows] = await pool.query(
    `SELECT
       id,
       round_id,
       hole_number,
       par,
       score,
       putts,
       gir,
       fir,
       penalties,
       notes
     FROM holes
     WHERE round_id = ?
     ORDER BY hole_number`,
    [roundId]
  );
  return rows;
}

// ✅ 개별 홀 업데이트 (스키마 정합)
async function updateHole(holeId, { score, putts, gir, fir, penalties = 0, notes }) {
  const [result] = await pool.query(
    `UPDATE holes
       SET score     = ?,
           putts     = ?,
           gir       = ?,
           fir    = ?,
           penalties = ?,
           notes     = ?
     WHERE id = ?`,
    [
      score != null ? Number(score) : null,
      putts != null ? Number(putts) : null,
      gir ? 1 : 0,
      fir ? 1 : 0,
      penalties != null ? Number(penalties) : 0,
      notes ?? null,
      holeId
    ]
  );
  return result.affectedRows;
}

// ✅ 권한 확인용: holeId → round_id, user_id
async function getHoleOwnerAndRound(holeId) {
  const [rows] = await pool.query(
    `SELECT h.round_id, r.user_id
       FROM holes h
       JOIN rounds r ON r.id = h.round_id
     WHERE h.id = ?`,
    [holeId]
  );
  return rows[0] || null;
}

module.exports = {
  createHoles,
  getHolesByRound,
  updateHole,
  getHoleOwnerAndRound,
};
