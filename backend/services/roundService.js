const { pool, tx } = require('../config/db');
const { assertRoundOwner } = require('../utils/ownership');

/**
 * 라운드 생성 + 18홀 스켈레톤 생성(트랜잭션)
 */
async function createRound({ userId, course_name, date, tee_time = null, notes = null }) {
  return tx(async (conn) => {
    const [r] = await conn.query(
      'INSERT INTO rounds (user_id, course_name, `date`, tee_time, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, course_name, date, tee_time, notes]
    );
    const roundId = r.insertId;

    // 18홀 기본 par=4
    const values = Array.from({ length: 18 }, (_, i) => [roundId, i + 1, 4]);
    // 호환성 좋은 방식: (?,?,?) 묶음으로 펼쳐서 INSERT
    const placeholders = values.map(() => '(?,?,?)').join(',');
    const flat = values.flat();
    await conn.query(
      `INSERT INTO holes (round_id, hole_number, par) VALUES ${placeholders}`,
      flat
    );

    return roundId;
  });
}

/**
 * 라운드 상세: round 1건 + holes 18건
 * 소유권 체크 포함
 */
async function getRoundDetail({ roundId, userId }) {
  await assertRoundOwner(roundId, userId); // 없거나 타인 소유면 에러

  const [[round]] = await pool.query('SELECT * FROM rounds WHERE id=?', [roundId]);
  const [holes]  = await pool.query(
    'SELECT * FROM holes WHERE round_id=? ORDER BY hole_number',
    [roundId]
  );

  return { round, holes };
}

/**
 * 내 라운드 목록(가벼운 요약 포함)
 */
async function listRounds({ userId, status = null, limit = 20, offset = 0 }) {
  const params = [userId];
  let where = 'WHERE r.user_id = ?';
  if (status) { where += ' AND r.status = ?'; params.push(status); }
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(
    `
    SELECT
      r.id, r.date, r.course_name, r.status,
      -- 부분 입력 허용: NULL은 자동 제외
      SUM(h.score)                           AS to_par_partial,
      SUM(h.putts)                           AS putts_partial,
      ROUND(AVG(CASE WHEN h.par IN (4,5) AND h.fir IS NOT NULL THEN h.fir END)*100,1) AS fir_pct,
      ROUND(AVG(CASE WHEN h.gir IS NOT NULL THEN h.gir END)*100,1)                    AS gir_pct
    FROM rounds r
    LEFT JOIN holes h ON h.round_id = r.id
    ${where}
    GROUP BY r.id
    ORDER BY r.date DESC, r.id DESC
    LIMIT ? OFFSET ?
    `,
    params
  );
  return rows;
}

/**
 * 라운드 메타/상태 수정 (status=final 전환 시 완결성 검사)
 */
async function updateRound({ roundId, userId, payload }) {
  await assertRoundOwner(roundId, userId);

  // status=final이면 입력 완결성 검사(예: score/putts 전부 입력)
  if (payload.status === 'final') {
    const [[chk]] = await pool.query(
      `SELECT SUM(CASE WHEN par IS NULL OR score IS NULL OR putts IS NULL THEN 1 ELSE 0 END) AS missing
       FROM holes WHERE round_id = ?`,
      [roundId]
    );
    if (chk.missing > 0) {
      const err = new Error('cannot finalize: some holes are incomplete');
      err.status = 422;
      err.details = { missingHoles: chk.missing };
      throw err;
    }
  }

  const fields = ['course_name','date','tee_time','status','notes'];
  const sets = [];
  const vals = [];
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(payload, f)) {
      sets.push(`${f} = ?`);
      vals.push(payload[f]);
    }
  }
  if (sets.length === 0) {
    const [[r]] = await pool.query('SELECT * FROM rounds WHERE id=?', [roundId]);
    return r;
  }

  vals.push(roundId);
  await pool.query(`UPDATE rounds SET ${sets.join(', ')} WHERE id=?`, vals);

  const [[r]] = await pool.query('SELECT * FROM rounds WHERE id=?', [roundId]);
  return r;
}

/**
 * 라운드 삭제 (holes는 FK CASCADE)
 */
async function deleteRound({ roundId, userId }) {
  await assertRoundOwner(roundId, userId);
  await pool.query('DELETE FROM rounds WHERE id=?', [roundId]);
}
module.exports = {
  createRound,
  getRoundDetail,
  listRounds,
  updateRound,
  deleteRound,
};


