// backend/models/statsModel.js
const pool = require('../config/db');

module.exports = {
  // 요약: 평균 퍼팅, FIR%, GIR%, 평균 To-Par, 라운드/홀 수
  async fetchSummary(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        ROUND(AVG(IFNULL(h.putts,0)), 2) AS avg_putts,
        -- FIR: par 4+ 만 모수로 계산 (AVG는 NULL 제외)
        ROUND(IFNULL(AVG(CASE WHEN h.par >= 4 THEN IFNULL(h.fw_hit,0) END), 0) * 100, 1) AS fir_pct,
        -- GIR: 모든 홀 대상
        ROUND(AVG(IFNULL(h.gir,0)) * 100, 1) AS gir_pct,
        ROUND(AVG(IFNULL(h.score,0) - IFNULL(h.par,0)), 2) AS avg_to_par,
        COUNT(DISTINCT r.id) AS rounds,
        COUNT(*) AS holes
      FROM holes h
      JOIN rounds r ON r.id = h.round_id
      WHERE r.user_id = ?
      `,
      [userId]
    );
    return rows[0] || {};
  },

  // 코스별 집계
  async fetchByCourse(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        r.course_name AS course,
        COUNT(DISTINCT r.id) AS rounds,
        ROUND(AVG(IFNULL(h.score,0) - IFNULL(h.par,0)), 2) AS avg_to_par,
        ROUND(AVG(IFNULL(h.putts,0)), 2) AS avg_putts,
        ROUND(IFNULL(AVG(CASE WHEN h.par >= 4 THEN IFNULL(h.fw_hit,0) END), 0) * 100, 1) AS fir_pct,
        ROUND(AVG(IFNULL(h.gir,0)) * 100, 1) AS gir_pct
      FROM holes h
      JOIN rounds r ON r.id = h.round_id
      WHERE r.user_id = ?
      GROUP BY r.course_name
      ORDER BY rounds DESC, course ASC
      `,
      [userId]
    );
    return rows;
  },

  // 트렌드: 라운드별 To-Par, FIR%, GIR%, 총 퍼팅
  async fetchTrend(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        r.id AS round_id,
        DATE(r.date) AS date,
        SUM(IFNULL(h.score,0) - IFNULL(h.par,0)) AS to_par,
        ROUND(IFNULL(AVG(CASE WHEN h.par >= 4 THEN IFNULL(h.fw_hit,0) END), 0) * 100, 1) AS fir_pct,
        ROUND(AVG(IFNULL(h.gir,0)) * 100, 1) AS gir_pct,
        SUM(IFNULL(h.putts,0)) AS total_putts
      FROM holes h
      JOIN rounds r ON r.id = h.round_id
      WHERE r.user_id = ?
      GROUP BY r.id, DATE(r.date)
      ORDER BY r.date ASC
      `,
      [userId]
    );
    return rows;
  },
};
