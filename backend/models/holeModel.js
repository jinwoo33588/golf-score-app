const pool = require('../config/db');

// 여러 홀을 한 번에 생성
// holesData = [{ hole_number, par }, …]
async function createHoles(roundId, holesData) {
  // 각 홀 객체에서 새 필드를 포함해 값을 뽑아냅니다.
  const values = holesData.map(h => [
    roundId,
    h.hole_number,
    h.par,
    h.score    ?? null,
    h.putts    ?? null,
    h.gir ? 1 : 0,
    h.fw_hit   ? 1 : 0,
    h.penalties ?? 0
  ]);
  const [result] = await pool.query(
    `INSERT INTO holes
     (round_id, hole_number, par, score, putts, gir, fw_hit, penalties)
   VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

// 2) 라운드의 모든 홀 불러오기 (스키마에 맞춰 teeshot/approach 제거)
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
       fw_hit,
       penalties
     FROM holes
     WHERE round_id = ?
     ORDER BY hole_number`,
    [roundId]
  );
  return rows;
}

// (Optional) 개별 홀 업데이트 시에도 teeshot/approach 등을 반영하려면 아래처럼 확장
async function updateHole(holeId, { score, teeshot, approach, putts, gir, fw_hit, penalties = 0, notes }) {
  const [result] = await pool.query(
    `UPDATE holes
     SET score    = ?,
         teeshot  = ?,
         approach = ?,
         putts    = ?,
         gir      = ?,
         fw_hit   = ?,
         penalties= ?,
         notes    = ?
     WHERE id = ?`,
    [ score, teeshot, approach, putts, gir ? 1 : 0, fw_hit, penalties, notes, holeId ]
  );
  return result.affectedRows;
}

module.exports = {
  createHoles,
  getHolesByRound,
  updateHole
};
