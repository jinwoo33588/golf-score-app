// backend/controllers/holeController.js
const { pool } = require('../config/db');
const { finalizeIfCompleteScores } = require('../services/statsService');


/* ---------- 공통 유틸 ---------- */
const intOrNull = (x) => {
  if (x === undefined || x === null || x === '') return null;
  const n = Number(x);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const to01 = (v) =>
  v === null || v === undefined || v === '' ? null
  : (v === 0 || v === '0' ? 0 : (v === 1 || v === '1' ? 1 : null));

function sanitizeHoleInput(it) {
  const hole_number = intOrNull(it.hole_number);
  const par = intOrNull(it.par);
  const score = intOrNull(it.score);
  const putts = intOrNull(it.putts);
  const penalties = intOrNull(it.penalties);
  let fir = to01(it.fir);
  let gir = to01(it.gir);
  const notes = it.notes ?? null;

  if (!hole_number || hole_number < 1 || hole_number > 36) return { error: 'invalid hole_number' };
  if (![3,4,5,6].includes(par)) return { error: 'invalid par' };
  if (score != null && (score < -5 || score > 5)) return { error: 'score out of range' };
  if (putts != null && (putts < 0 || putts > 6)) return { error: 'putts out of range' };
  if (penalties != null && (penalties < 0 || penalties > 9)) return { error: 'penalties out of range' };
  if (par === 3) fir = null; // 규칙: Par3 → FIR null
  return { hole_number, par, score, putts, penalties, fir, gir, notes };
}

/* ---------- 컨트롤러 ---------- */

// PUT /api/holes/:holeId
exports.updateOne = async (req, res, next) => {
  try {
    const holeId = Number(req.params.holeId);
    if (!Number.isInteger(holeId) || holeId <= 0) {
      return res.status(400).json({ message: 'invalid hole id' });
    }

    const patch = {
      par: intOrNull(req.body.par),
      score: intOrNull(req.body.score),
      putts: intOrNull(req.body.putts),
      penalties: intOrNull(req.body.penalties),
      fir: to01(req.body.fir),
      gir: to01(req.body.gir),
      notes: req.body.notes ?? null,
    };
    if (patch.par === 3) patch.fir = null;

    const fields = [], vals = [];
    for (const [k,v] of Object.entries(patch)) {
      if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); }
    }
    if (!fields.length) {
      const [[row]] = await pool.query('SELECT * FROM holes WHERE id=?', [holeId]);
      return res.json({ data: row });
    }
    vals.push(holeId);
    await pool.query(`UPDATE holes SET ${fields.join(', ')} WHERE id=?`, vals);

    // 수정 후 최신 데이터 조회
    const [[row]] = await pool.query('SELECT * FROM holes WHERE id=?', [holeId]);

    // ✅ 추가: 자동 final 판정 (18홀 & 모든 score 입력 시 final, 다운그레이드 없음)
    const userId = req.user.id;                         // ✅ 추가
    if (row?.round_id) {                                // ✅ 추가
      await finalizeIfCompleteScores({                  // ✅ 추가
        roundId: row.round_id,                          // ✅ 추가
        userId                                          // ✅ 추가
      });                                               // ✅ 추가
    }                                                   // ✅ 추가

    res.json({ data: row });
  } catch (e) { next(e); }
};

// PUT /api/rounds/:id/holes   body: HolePartial[]  또는 {items:[]}
exports.bulkUpdate = async (req, res, next) => {
  const roundId = Number(req.params.id);
  const body = Array.isArray(req.body) ? req.body
            : Array.isArray(req.body?.items) ? req.body.items
            : Array.isArray(req.body?.holes) ? req.body.holes
            : null;
  if (!body) return res.status(400).json({ error: { message: 'body must be array or {items:[]}' } });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    for (const raw of body) {
      const h = sanitizeHoleInput(raw);
      if (h.error) {
        await conn.rollback();
        return res.status(422).json({ error: { message: h.error } });
      }

      const params = [h.par, h.score, h.putts, h.penalties, h.fir, h.gir, h.notes, roundId, h.hole_number];
      const [r] = await conn.query(
        `UPDATE holes
           SET par=?, score=?, putts=?, penalties=?, fir=?, gir=?, notes=?
         WHERE round_id=? AND hole_number=?`,
        params
      );
      if (r.affectedRows === 0) {
        await conn.query(
          `INSERT INTO holes (round_id, hole_number, par, score, putts, penalties, fir, gir, notes)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          [roundId, h.hole_number, h.par, h.score, h.putts, h.penalties, h.fir, h.gir, h.notes]
        );
      }
    }

    await conn.commit();

    // ✅ 추가: 벌크 저장 후 자동 final 판정 (다운그레이드 없음)
    const userId = req.user.id;                         // ✅ 추가
    await finalizeIfCompleteScores({                    // ✅ 추가
      roundId,                                          // ✅ 추가
      userId                                            // ✅ 추가
    });                                                 // ✅ 추가

    const [rows] = await pool.query('SELECT * FROM holes WHERE round_id=? ORDER BY hole_number', [roundId]);
    res.json({ data: rows });
  } catch (e) {
    if (conn) await conn.rollback();
    next(e);
  } finally {
    if (conn) conn.release();
  }
};
