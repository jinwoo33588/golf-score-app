// backend/models/shotModel.js
const pool = require('../config/db');

// 여러 샷을 한 번에 생성
// shotsData = [{ shot_number, club, start_location, end_location,
//                distance, result, lie, notes }, …]
async function createShots(holeId, shotsData) {
  const values = shotsData.map(s => [
    holeId,
    // schema 순서대로: hole_id, shot_number, club, start_location, end_location,
    //                distance,      result,     lie,        notes
    s.shot_number,                  // INT NOT NULL
    s.club           || '-',        // VARCHAR(50) DEFAULT '-'
    s.start_location || '-',        // VARCHAR(50) DEFAULT '-'
    s.end_location   || '-',        // VARCHAR(50) DEFAULT '-'
    s.distance       ?? null,       // INT DEFAULT NULL
    s.result         || '-',        // VARCHAR(255) DEFAULT '-'
    s.lie            || '-',        // VARCHAR(50) DEFAULT '-'
    s.notes          || null        // TEXT DEFAULT NULL
  ]);

  const [result] = await pool.query(
    `INSERT INTO shots
       (hole_id, shot_number, club,
        start_location, end_location,
        distance, result, lie, notes)
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
       start_location,
       end_location,
       distance,
       result,
       lie,
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
