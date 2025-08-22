// backend/utils/ownership.js
const { pool } = require('../config/db');

/** 서비스형: 비-라우터 계층(services/models)에서 사용 */
async function assertRoundOwnerSvc(roundId, userId) {
  const [[row]] = await pool.query('SELECT user_id FROM rounds WHERE id=?', [roundId]);
  if (!row) {
    const err = new Error('round not found');
    err.status = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('forbidden');
    err.status = 403;
    throw err;
  }
}

/** 미들웨어형: 라우터에서 사용 */
async function assertRoundOwnerMw(req, res, next) {
  try {
    const raw = req.params.id ?? req.params.roundId ?? req.body.round_id;
    const roundId = Number(raw);
    if (!Number.isInteger(roundId) || roundId <= 0) {
      return res.status(400).json({ message: 'invalid round id' });
    }
    await assertRoundOwnerSvc(roundId, req.user.id);
    next();
  } catch (e) { next(e); }
}

/** /holes/:holeId 계열 미들웨어 (기존 그대로 유지 가능) */
async function assertHoleOwner(req, res, next) {
  try {
    const raw = req.params.holeId ?? req.params.id;
    const holeId = Number(raw);
    if (!Number.isInteger(holeId) || holeId <= 0) {
      return res.status(400).json({ message: 'invalid hole id' });
    }
    const [rows] = await pool.query(
      `SELECT r.user_id
         FROM holes h
         JOIN rounds r ON r.id = h.round_id
        WHERE h.id=?`,
      [holeId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'hole not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'forbidden' });
    next();
  } catch (e) { next(e); }
}

module.exports = {
  assertRoundOwnerSvc,   // 서비스형
  assertRoundOwnerMw,    // 미들웨어형
  assertHoleOwner,
};
