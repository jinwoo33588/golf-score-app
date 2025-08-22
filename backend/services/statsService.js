const { pool } = require('../config/db');
const { assertRoundOwner } = require('../utils/ownership');

/**
 * 라운드 단일 통계
 * mode:
 *  - partial: 입력된 홀만 계산 (기본)
 *  - strict : 18홀 모두 입력되지 않으면 422
 */
async function getRoundStats({ roundId, userId, mode = 'partial' }) {
  // 소유권 보장
  await assertRoundOwner(roundId, userId);

  if (mode === 'strict') {
    const [[m]] = await pool.query(
      `SELECT COUNT(*) AS missing
         FROM holes
        WHERE round_id = ?
          AND (par IS NULL OR score IS NULL OR putts IS NULL)`,
      [roundId]
    );
    if (Number(m.missing) > 0) {
      const err = new Error('incomplete holes');
      err.status = 422;
      err.details = { missingHoles: Number(m.missing) };
      throw err;
    }
  }

  const [rows] = await pool.query(
    `
    SELECT
      SUM(CASE WHEN h.score IS NOT NULL THEN (h.par + h.score) END)                          AS strokes_total,
      SUM(h.score)                                                                          AS to_par,
      SUM(h.putts)                                                                          AS putts_total,
      ROUND(AVG(CASE WHEN h.par IN (4,5) AND h.fir IS NOT NULL THEN h.fir END)*100, 1)      AS fir_pct,
      ROUND(AVG(CASE WHEN h.gir IS NOT NULL THEN h.gir END)*100, 1)                          AS gir_pct,
      ROUND(AVG(CASE WHEN h.putts IS NOT NULL THEN (h.putts >= 3) END)*100, 1)               AS three_putt_rate,
      ROUND(AVG(CASE WHEN h.score IS NOT NULL THEN (h.score >= 2) END)*100, 1)               AS double_or_worse_rate,
      SUM(h.penalties)                                                                       AS penalties_total,
      AVG(CASE WHEN h.par = 3 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par3_avg,
      AVG(CASE WHEN h.par = 4 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par4_avg,
      AVG(CASE WHEN h.par = 5 AND h.score IS NOT NULL THEN (h.par + h.score) END)            AS par5_avg,
      SUM(CASE WHEN h.hole_number BETWEEN 1 AND  9 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS out_total,
      SUM(CASE WHEN h.hole_number BETWEEN 10 AND 18 AND h.score IS NOT NULL THEN (h.par + h.score) END) AS in_total,
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
  // 그대로 반환 (NULL은 프론트에서 '-' 처리)
  return {
    round_id: roundId,
    holes_filled: num(r.holes_filled),
    strokes_total: num(r.strokes_total),
    to_par: num(r.to_par),
    putts_total: num(r.putts_total),
    fir_pct: num(r.fir_pct),
    gir_pct: num(r.gir_pct),
    three_putt_rate: num(r.three_putt_rate),
    double_or_worse_rate: num(r.double_or_worse_rate),
    penalties_total: num(r.penalties_total),
    par3_avg: num(r.par3_avg),
    par4_avg: num(r.par4_avg),
    par5_avg: num(r.par5_avg),
    out_total: num(r.out_total),
    in_total: num(r.in_total),
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
      AVG(ROUND_SUM.strokes_total)              AS strokes_avg,
      AVG(ROUND_SUM.to_par)                     AS to_par_avg,
      AVG(ROUND_SUM.putts_total)                AS putts_avg,
      ROUND(AVG(ROUND_SUM.fir_ratio)*100, 1)    AS fir_pct,
      ROUND(AVG(ROUND_SUM.gir_ratio)*100, 1)    AS gir_pct,
      ROUND(AVG(ROUND_SUM.three_putt_ratio)*100, 1)     AS three_putt_rate,
      ROUND(AVG(ROUND_SUM.double_plus_ratio)*100, 1)    AS double_or_worse_rate,
      AVG(ROUND_SUM.penalties_total)            AS penalties_avg,
      AVG(ROUND_SUM.par3_avg)                   AS par3_avg,
      AVG(ROUND_SUM.par4_avg)                   AS par4_avg,
      AVG(ROUND_SUM.par5_avg)                   AS par5_avg
    FROM (
      SELECT
        r.id,
        SUM(CASE WHEN h.score IS NOT NULL THEN (h.par + h.score) END) AS strokes_total,
        SUM(h.score)                                                  AS to_par,
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
    to_par_avg: num(r.to_par_avg),
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

// null-safe number 변환 도우미
function num(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** 
 * 18홀 모두 있고, 각 홀의 score가 전부 NULL이 아니면 라운드를 final로 올린다.
 * - putts는 검사하지 않음
 * - final → draft 다운그레이드는 하지 않음
 */
async function finalizeIfCompleteScores({ roundId, userId }) {
  // 소유권 보장
  await assertRoundOwner(roundId, userId);

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

  // 18홀 모두 존재 + 모든 score가 입력됨
  if (holesCnt === 18 && filledScores === 18) {
    await pool.query(
      `UPDATE rounds 
          SET status='final' 
        WHERE id=? AND user_id=? AND status <> 'final'`,
      [roundId, userId]
    );
  }
}

module.exports = { getRoundStats, getUserOverview, finalizeIfCompleteScores };
