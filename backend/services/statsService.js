// backend/services/statsService.js
const { pool } = require('../config/db');
const { assertRoundOwnerSvc } = require('../utils/ownership'); // 서비스형 소유권 보장 함수로 교체 권장

// null-safe number 변환
function num(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * 라운드 단일 통계
 * mode:
 *  - partial: 입력된 홀만 계산 (기본)
 *  - strict : 18홀 모두 입력되지 않으면 422 (par & score 기준. putts는 미포함)
 */
async function getRoundStats({ roundId, userId, mode = 'partial' }) {
  // 소유권 보장(서비스형)
  await assertRoundOwnerSvc(roundId, userId);

  if (mode === 'strict') {
    // 18홀 모두 존재 + par/score 모두 입력되어야 함 (putts는 검사 제외)
    const [[m]] = await pool.query(
      `SELECT 
         SUM(CASE WHEN par IS NULL OR score IS NULL THEN 1 ELSE 0 END) AS missing
       FROM holes
       WHERE round_id = ?`,
      [roundId]
    );
    if (Number(m?.missing || 0) > 0) {
      const err = new Error('incomplete holes');
      err.status = 422;
      err.details = { missingHoles: Number(m.missing) };
      throw err;
    }
  }

  const [rows] = await pool.query(
    `
    SELECT
      SUM(CASE WHEN h.score IS NOT NULL THEN (h.par + h.score) END)                           AS total_strokes,
      SUM(h.score)                                                                           AS total_score,
      SUM(h.putts)                                                                           AS putts_total,
      ROUND(AVG(CASE WHEN h.par IN (4,5) AND h.fir IS NOT NULL THEN h.fir END) * 100, 1)     AS fir_pct,
      ROUND(AVG(CASE WHEN h.gir IS NOT NULL THEN h.gir END) * 100, 1)                        AS gir_pct,
      ROUND(AVG(CASE WHEN h.putts IS NOT NULL THEN (h.putts >= 3) END) * 100, 1)             AS three_putt_rate,
      ROUND(AVG(CASE WHEN h.score IS NOT NULL THEN (h.score >= 2) END) * 100, 1)             AS double_or_worse_rate,
      SUM(h.penalties)                                                                        AS penalties_total,
      AVG(CASE WHEN h.par = 3 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par3_avg,
      AVG(CASE WHEN h.par = 4 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par4_avg,
      AVG(CASE WHEN h.par = 5 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par5_avg,
      SUM(CASE WHEN h.hole_number BETWEEN 1 AND  9 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS out_strokes,
      SUM(CASE WHEN h.hole_number BETWEEN 10 AND 18 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS in_strokes,
      SUM(h.score IS NOT NULL)                                                                AS holes_filled,
      SUM(CASE WHEN h.score <= -2 THEN 1 ELSE 0 END)                                         AS eagle_cnt,
      SUM(CASE WHEN h.score =  -1 THEN 1 ELSE 0 END)                                         AS birdie_cnt,
      SUM(CASE WHEN h.score =   0 THEN 1 ELSE 0 END)                                         AS par_cnt,
      SUM(CASE WHEN h.score =   1 THEN 1 ELSE 0 END)                                         AS bogey_cnt,
      SUM(CASE WHEN h.score >=  2 THEN 1 ELSE 0 END)                                         AS double_plus_cnt
    FROM holes h
    WHERE h.round_id = ?
    `,
    [roundId]
  );

  const r = rows[0] || {};
  return {
    round_id: roundId,
    holes_filled: num(r.holes_filled),
    total_strokes: num(r.total_strokes),
    total_score: num(r.total_score),
    putts_total: num(r.putts_total),
    fir_pct: num(r.fir_pct),
    gir_pct: num(r.gir_pct),
    three_putt_rate: num(r.three_putt_rate),
    double_or_worse_rate: num(r.double_or_worse_rate),
    penalties_total: num(r.penalties_total),
    par3_avg: num(r.par3_avg),
    par4_avg: num(r.par4_avg),
    par5_avg: num(r.par5_avg),
    out_strokes: num(r.out_strokes),
    in_strokes: num(r.in_strokes),
    dist: {
      eagle: num(r.eagle_cnt),
      birdie: num(r.birdie_cnt),
      par: num(r.par_cnt),
      bogey: num(r.bogey_cnt),
      double_plus: num(r.double_plus_cnt),
    }
  };
}

/**
 * 유저 기간 개요 통계
 * status: final | draft | all
 * from/to: YYYY-MM-DD (옵션)
 */
async function getUserOverview({ userId, from = null, to = null, status = 'final' }) {
  const where = ['r.user_id = ?'];
  const params = [userId];

  if (status !== 'all') { where.push('r.status = ?'); params.push(status); }
  if (from) { where.push('r.date >= ?'); params.push(from); }
  if (to) { where.push('r.date <= ?'); params.push(to); }

  const whereSql = where.join(' AND ');

  const [rows] = await pool.query(
    `
    SELECT
      COUNT(*)                                  AS rounds_count,
      AVG(ROUND_SUM.total_strokes)              AS strokes_avg,
      AVG(ROUND_SUM.total_score)                AS total_score_avg,
      AVG(ROUND_SUM.putts_total)                AS putts_avg,
      ROUND(AVG(ROUND_SUM.fir_ratio) * 100, 1)  AS fir_pct,
      ROUND(AVG(ROUND_SUM.gir_ratio) * 100, 1)  AS gir_pct,
      ROUND(AVG(ROUND_SUM.three_putt_ratio) * 100, 1)     AS three_putt_rate,
      ROUND(AVG(ROUND_SUM.double_plus_ratio) * 100, 1)    AS double_or_worse_rate,
      AVG(ROUND_SUM.penalties_total)            AS penalties_avg,
      AVG(ROUND_SUM.par3_avg)                   AS par3_avg,
      AVG(ROUND_SUM.par4_avg)                   AS par4_avg,
      AVG(ROUND_SUM.par5_avg)                   AS par5_avg
    FROM (
      SELECT
        r.id,
        SUM(CASE WHEN h.score IS NOT NULL THEN (h.par + h.score) END) AS total_strokes,
        SUM(h.score)                                                  AS total_score,
        SUM(h.putts)                                                  AS putts_total,
        AVG(CASE WHEN h.par IN (4,5) AND h.fir IS NOT NULL THEN h.fir END)     AS fir_ratio,
        AVG(CASE WHEN h.gir IS NOT NULL THEN h.gir END)                        AS gir_ratio,
        AVG(CASE WHEN h.putts IS NOT NULL THEN (h.putts >= 3) END)             AS three_putt_ratio,
        AVG(CASE WHEN h.score IS NOT NULL THEN (h.score >= 2) END)             AS double_plus_ratio,
        SUM(h.penalties)                                                       AS penalties_total,
        AVG(CASE WHEN h.par = 3 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS par3_avg,
        AVG(CASE WHEN h.par = 4 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS par4_avg,
        AVG(CASE WHEN h.par = 5 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS par5_avg
      FROM rounds r
      JOIN holes h ON h.round_id = r.id
      WHERE ${whereSql}
      GROUP BY r.id
    ) AS ROUND_SUM
    `,
    params
  );

  const r = rows[0] || {};
  return {
    rounds_count: num(r.rounds_count),
    strokes_avg: num(r.strokes_avg),
    total_score_avg: num(r.total_score_avg),
    putts_avg: num(r.putts_avg),
    fir_pct: num(r.fir_pct),
    gir_pct: num(r.gir_pct),
    three_putt_rate: num(r.three_putt_rate),
    double_or_worse_rate: num(r.double_or_worse_rate),
    penalties_avg: num(r.penalties_avg),
    par3_avg: num(r.par3_avg),
    par4_avg: num(r.par4_avg),
    par5_avg: num(r.par5_avg),
  };
}

/** 
 * 18홀 모두 있고, 각 홀의 score가 전부 NULL이 아니면 라운드를 final로 올린다.
 * - putts는 검사하지 않음
 * - final → draft 다운그레이드는 하지 않음
 */
async function finalizeIfCompleteScores({ roundId, userId }) {
  await assertRoundOwnerSvc(roundId, userId);

  const [[row]] = await pool.query(
    `SELECT 
       COUNT(*)                 AS holesCnt,
       SUM(h.score IS NOT NULL) AS filledScores
     FROM holes h
     WHERE h.round_id = ?`,
    [roundId]
  );

  const holesCnt = Number(row?.holesCnt || 0);
  const filledScores = Number(row?.filledScores || 0);

  if (holesCnt === 18 && filledScores === 18) {
    await pool.query(
      `UPDATE rounds 
          SET status='final' 
        WHERE id=? AND user_id=? AND status <> 'final'`,
      [roundId, userId]
    );
  }
}

async function getTrend({ userId, limit = 10, includeDraft = false }) {
  const [rows] = await pool.query(
    `
    SELECT
      r.id AS round_id, r.date, r.course_name,
      SUM(h.par + COALESCE(h.score,0)) AS strokes,
      SUM(COALESCE(h.score,0))         AS score,
      SUM(COALESCE(h.putts,0))         AS putts,
      ROUND(AVG(CASE WHEN h.par IN (4,5) THEN (h.fir IS TRUE) END)*100,1) AS fir_pct,
      ROUND(AVG(h.gir IS TRUE)*100,1)                                     AS gir_pct
    FROM rounds r
    JOIN holes h ON h.round_id = r.id
    WHERE r.user_id = ?
      AND (r.status='final' OR (? = TRUE))
    GROUP BY r.id
    ORDER BY r.date DESC
    LIMIT ?;
    `,
    [userId, includeDraft, limit]
  );
  return { items: rows };
}

module.exports = { getRoundStats, getUserOverview, finalizeIfCompleteScores, getTrend };
