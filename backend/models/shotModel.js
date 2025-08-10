const pool = require('../config/db');

// 여러 샷을 한 번에 생성
async function createShots(holeId, shotsData) {
  const values = shotsData.map(s => [
    holeId,
    Number(s.shot_number),           // shot_number
    s.club         || '-',           // club
    s.condition    || '-',           // condition
    s.remaining_dist != null
      ? Number(s.remaining_dist)
      : null,                        // remaining_dist
    s.actual_dist != null
      ? Number(s.actual_dist)
      : null,                        // actual_dist
    s.result       || '-',           // result
    s.notes        || null           // notes
  ]);

  const [result] = await pool.query(
    `INSERT INTO shots
       (hole_id, shot_number, club,
        \`condition\`, remaining_dist, actual_dist,
        result, notes)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

// 홀별 샷 조회
async function getShotsByHole(holeId) {
  const [rows] = await pool.query(
    `SELECT
       id,
       hole_id,
       shot_number,
       club,
       \`condition\`,
       remaining_dist,
       actual_dist,
       result,
       notes
     FROM shots
     WHERE hole_id = ?
     ORDER BY shot_number`,
    [holeId]
  );
  return rows;
}

module.exports = {
  createShots,
  getShotsByHole
};
