const pool = require('../config/db');

// 여러 홀을 한 번에 생성
// holesData = [{ hole_number, par }, …]
async function createHoles(roundId, holesData) {
  const values = holesData.map(h => [roundId, h.hole_number, h.par]);
  const [result] = await pool.query(
    `INSERT INTO holes (round_id, hole_number, par)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

// 라운드의 모든 홀 불러오기
async function getHolesByRound(roundId) {
  const [rows] = await pool.query(
    `SELECT * FROM holes
     WHERE round_id = ?
     ORDER BY hole_number`,
    [roundId]
  );
  return rows;
}

// 홀 업데이트 예시 (스코어, 퍼팅 등)
async function updateHole(holeId, { score, putts, gir, fw_hit, penalties = 0, notes }) {
  const [result] = await pool.query(
    `UPDATE holes
     SET score    = ?,
         putts    = ?,
         gir      = ?,
         fw_hit   = ?,
         penalties= ?,
         notes    = ?
     WHERE id = ?`,
    [ score, putts, gir, fw_hit, penalties, notes, holeId ]
  );
  return result.affectedRows;
}

module.exports = {
  createHoles,
  getHolesByRound,
  updateHole
};
