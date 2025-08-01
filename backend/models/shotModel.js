const pool = require('../config/db');

// 여러 샷을 한 번에 생성
// shotsData = [{ shot_number, club, start_location, … }, …]
async function createShots(holeId, shotsData) {
  const values = shotsData.map(s => [
    holeId,
    s.shot_number,
    s.club     || '-',
    s.start_location || '-',
    s.end_location   || '-',
    s.distance || null,
    s.result   || '-',
    s.lie      || '-',
    s.notes    || null
  ]);
  const [result] = await pool.query(
    `INSERT INTO shots
     (hole_id, shot_number, club, start_location, end_location,
      distance, result, lie, notes)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

// 홀별 샷 조회
async function getShotsByHole(holeId) {
  const [rows] = await pool.query(
    `SELECT * FROM shots
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
