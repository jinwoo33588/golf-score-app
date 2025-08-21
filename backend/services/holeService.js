const { pool } = require('../config/db');
const { assertHoleOwner } = require('../utils/ownership');
const { normalizeHolePayload } = require('../utils/normalizeHolePayload');

const ALLOWED_FIELDS = ['par', 'score', 'putts', 'penalties', 'fir', 'gir', 'notes'];

/**
 * 단일 홀 수정
 * - 소유권 체크
 * - par=3 → fir=NULL 등 정규화
 * - 변경 후 최신 홀 데이터 반환
 */
async function updateHole({ holeId, userId, payload }) {
  await assertHoleOwner(holeId, userId);

  // par가 요청에 없으면 현재 값을 조회해서 정규화 판단에 사용
  let currentPar;
  if (payload.par === undefined) {
    const [[row]] = await pool.query('SELECT par FROM holes WHERE id=?', [holeId]);
    if (!row) { const err = new Error('Hole not found'); err.status = 404; throw err; }
    currentPar = row.par;
  }

  const normalized = normalizeHolePayload(
    payload.par === undefined ? { ...payload, par: currentPar } : payload
  );

  const sets = [];
  const values = [];
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      sets.push(`${key} = ?`);
      values.push(normalized[key]);
    }
  }

  if (sets.length === 0) {
    const [[hole]] = await pool.query('SELECT * FROM holes WHERE id=?', [holeId]);
    return hole; // 변경 없음
  }

  values.push(holeId);
  await pool.query(`UPDATE holes SET ${sets.join(', ')} WHERE id=?`, values);

  const [[hole]] = await pool.query('SELECT * FROM holes WHERE id=?', [holeId]);
  return hole;
}

/**
 * 라운드 단위 벌크 업데이트
 * holes: [{ hole_number, ...fields }]
 */
async function bulkUpdateHoles({ roundId, userId, holes }) {
  await assertRoundOwner(roundId, userId);

  // 번호→현재 hole 레코드 매핑
  const [current] = await pool.query(
    'SELECT id, hole_number, par FROM holes WHERE round_id=?',
    [roundId]
  );
  if (current.length !== 18) {
    const err = new Error('holes skeleton not complete'); err.status = 409; throw err;
  }
  const byNo = new Map(current.map(h => [h.hole_number, h]));

  await tx(async (conn) => {
    for (const item of holes) {
      const hno = Number(item.hole_number);
      const row = byNo.get(hno);
      if (!row) continue;

      // par 유무에 따라 normalize 시 par 기준 결정
      const normalized = normalizeHolePayload(
        item.par === undefined ? { ...item, par: row.par } : item
      );

      const sets = [];
      const vals = [];
      for (const key of ALLOWED_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(normalized, key)) {
          sets.push(`${key} = ?`);
          vals.push(normalized[key]);
        }
      }
      if (sets.length === 0) continue;

      vals.push(row.id);
      await conn.query(`UPDATE holes SET ${sets.join(', ')} WHERE id=?`, vals);
    }
  });

  // 업데이트 후 최신 18개 반환
  const [updated] = await pool.query(
    'SELECT * FROM holes WHERE round_id=? ORDER BY hole_number',
    [roundId]
  );
  return updated;
}

module.exports = { updateHole, bulkUpdateHoles };


