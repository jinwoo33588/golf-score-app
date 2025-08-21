// backend/utils/ownership.js
const { pool } = require('../config/db');

/** /rounds/:id 계열에서 사용 */
async function assertRoundOwner(req, res, next) {
  try {
    const raw = req.params.id ?? req.params.roundId ?? req.body.round_id;
    const roundId = Number(raw);
    if (!Number.isInteger(roundId) || roundId <= 0) {
      return res.status(400).json({ message: 'invalid round id' });
    }
    const [rows] = await pool.query('SELECT user_id FROM rounds WHERE id=?', [roundId]);
    if (rows.length === 0) return res.status(404).json({ message: 'round not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'forbidden' });
    next();
  } catch (e) { next(e); }
}

/** /holes/:holeId 계열에서 사용 */
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

module.exports = { assertRoundOwner, assertHoleOwner };
