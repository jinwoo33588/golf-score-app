// backend/controllers/roundController.js
const { pool } = require('../config/db');

/* ---------- 목록 ---------- */
// GET /api/rounds?status=all|draft|final&limit=50
exports.listMine = async (req, res, next) => {
  try {
    const { status = 'all', limit = 50 } = req.query;
    const params = [req.user.id];
    let where = 'r.user_id = ?';
    if (status === 'draft') where += " AND r.status='draft'";
    if (status === 'final') where += " AND r.status='final'";

    const sql = `
      SELECT
        r.id, r.course_name,
        DATE_FORMAT(r.date, '%Y-%m-%d') AS date,
        r.tee_time, r.status,
        COALESCE(SUM(CASE WHEN h.score IS NOT NULL THEN h.score ELSE 0 END), 0) AS to_par_partial,
        COALESCE(SUM(CASE WHEN h.putts IS NOT NULL THEN h.putts ELSE 0 END), 0) AS putts_partial,
        CASE
          WHEN SUM(CASE WHEN h.par != 3 AND h.fir IS NOT NULL THEN 1 ELSE 0 END) = 0 THEN NULL
          ELSE ROUND(100 * SUM(CASE WHEN h.par != 3 AND h.fir=1 THEN 1 ELSE 0 END)
                         / SUM(CASE WHEN h.par != 3 AND h.fir IS NOT NULL THEN 1 ELSE 0 END), 1)
        END AS fir_pct,
        CASE
          WHEN SUM(CASE WHEN h.gir IS NOT NULL THEN 1 ELSE 0 END) = 0 THEN NULL
          ELSE ROUND(100 * SUM(CASE WHEN h.gir=1 THEN 1 ELSE 0 END)
                         / SUM(CASE WHEN h.gir IS NOT NULL THEN 1 ELSE 0 END), 1)
        END AS gir_pct
      FROM rounds r
      LEFT JOIN holes h ON h.round_id = r.id
      WHERE ${where}
      GROUP BY r.id
      ORDER BY r.date DESC, r.id DESC
      LIMIT ?
    `;
    params.push(Number(limit));
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (e) { next(e); }
};

/* ---------- 생성 ---------- */
// POST /api/rounds {course_name,date,tee_time?,notes?}
exports.create = async (req, res, next) => {
  try {
    const { course_name, date, tee_time=null, notes=null } = req.body || {};
    if (!course_name || !date) return res.status(400).json({ message: 'course_name and date required' });

    const [r] = await pool.query(
      `INSERT INTO rounds (user_id, course_name, date, tee_time, status, notes)
       VALUES (?,?,?,?, 'draft', ?)`,
      [req.user.id, course_name, date, tee_time, notes]
    );
    const id = r.insertId;

    // (선택) 1~18 기본홀 미리 생성하려면 여기에 INSERT bulk 추가

    res.status(201).json({ data: { id } });
  } catch (e) { next(e); }
};

/* ---------- 상세 ---------- */
// GET /api/rounds/:id
exports.detail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [[round]] = await pool.query(
      `SELECT id,course_name,DATE_FORMAT(date,'%Y-%m-%d') AS date,tee_time,status,notes
         FROM rounds WHERE id=?`, [id]
    );
    const [holes] = await pool.query(
      `SELECT * FROM holes WHERE round_id=? ORDER BY hole_number`, [id]
    );
    res.json({ data: { round, holes } });
  } catch (e) { next(e); }
};

/* ---------- 통계 ---------- */
// GET /api/rounds/:id/stats
exports.stats = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [holes] = await pool.query(
      `SELECT hole_number,par,score,putts,penalties,fir,gir
         FROM holes WHERE round_id=? ORDER BY hole_number`, [id]
    );

    const s = {
      strokes_total: null, to_par: null, putts_total: null,
      fir_pct: null, gir_pct: null, three_putt_rate: null, double_or_worse_rate: null,
      penalties_total: null, par3_avg: null, par4_avg: null, par5_avg: null,
      out_total: null, in_total: null,
      dist: { eagle:0,birdie:0,par:0,bogey:0,double_plus:0 },
      holes_filled: 0,
    };

    let strokesSum = 0, strokesCnt = 0;
    let puttsSum = 0, puttsCnt = 0;
    let firHit = 0, firDen = 0;
    let girHit = 0, girDen = 0;
    let threePutts = 0, threeDen = 0;
    let dblPlus = 0, scoreDen = 0;
    let penSum = 0, penCnt = 0;
    let out = 0, outCnt = 0, inn = 0, inCnt = 0;
    let p3Stk=0,p3Cnt=0, p4Stk=0,p4Cnt=0, p5Stk=0,p5Cnt=0;

    for (const h of holes) {
      const { hole_number, par, score, putts, penalties, fir, gir } = h;

      if (par != null && score != null) {
        const strokes = par + score;
        strokesSum += strokes; strokesCnt++;
        if (score <= -2) s.dist.eagle++;
        else if (score === -1) s.dist.birdie++;
        else if (score === 0) s.dist.par++;
        else if (score === 1) s.dist.bogey++;
        else if (score >= 2) { s.dist.double_plus++; dblPlus++; }
        scoreDen++;

        if (hole_number <= 9) { out += strokes; outCnt++; }
        else { inn += strokes; inCnt++; }

        if (par === 3) { p3Stk += strokes; p3Cnt++; }
        if (par === 4) { p4Stk += strokes; p4Cnt++; }
        if (par === 5) { p5Stk += strokes; p5Cnt++; }
      }

      if (putts != null) { puttsSum += putts; puttsCnt++; threeDen++; if (putts >= 3) threePutts++; }
      if (penalties != null) { penSum += penalties; penCnt++; }

      if (par !== 3 && fir != null) { firDen++; if (fir === 1) firHit++; }
      if (gir != null) { girDen++; if (gir === 1) girHit++; }

      if (score != null || putts != null) s.holes_filled++;
    }

    s.strokes_total = strokesCnt ? strokesSum : null;
    s.to_par = scoreDen ? holes.reduce((acc,h)=> acc + (h.score ?? 0), 0) : null;
    s.putts_total = puttsCnt ? puttsSum : null;
    s.fir_pct = firDen ? +(100*firHit/firDen).toFixed(1) : null;
    s.gir_pct = girDen ? +(100*girHit/girDen).toFixed(1) : null;
    s.three_putt_rate = threeDen ? +(100*threePutts/threeDen).toFixed(1) : null;
    s.double_or_worse_rate = scoreDen ? +(100*dblPlus/scoreDen).toFixed(1) : null;
    s.penalties_total = penCnt ? penSum : null;
    s.par3_avg = p3Cnt ? +(p3Stk/p3Cnt).toFixed(1) : null;
    s.par4_avg = p4Cnt ? +(p4Stk/p4Cnt).toFixed(1) : null;
    s.par5_avg = p5Cnt ? +(p5Stk/p5Cnt).toFixed(1) : null;
    s.out_total = outCnt ? out : null;
    s.in_total = inCnt ? inn : null;

    res.json({ data: s });
  } catch (e) { next(e); }
};

/* ---------- 수정(메타/상태) ---------- */
// PUT /api/rounds/:id  {status?, course_name?, date?, tee_time?, notes?}
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status, course_name, date, tee_time, notes } = req.body || {};

    if (status === 'final') {
      const [[row]] = await pool.query(
        `SELECT 
           SUM(CASE WHEN score IS NULL THEN 1 ELSE 0 END) AS null_scores,
           SUM(CASE WHEN putts IS NULL THEN 1 ELSE 0 END) AS null_putts
         FROM holes WHERE round_id=?`, [id]
      );
      if (row.null_scores > 0 || row.null_putts > 0) {
        return res.status(422).json({ message: '모든 홀의 score/putts가 입력되어야 마감할 수 있습니다.' });
      }
    }

    const fields = [], vals = [];
    if (status) { fields.push('status=?'); vals.push(status); }
    if (course_name !== undefined) { fields.push('course_name=?'); vals.push(course_name); }
    if (date !== undefined) { fields.push('date=?'); vals.push(date); }
    if (tee_time !== undefined) { fields.push('tee_time=?'); vals.push(tee_time); }
    if (notes !== undefined) { fields.push('notes=?'); vals.push(notes); }
    if (!fields.length) return res.json({ data: { id } });

    vals.push(id);
    await pool.query(`UPDATE rounds SET ${fields.join(', ')} WHERE id=?`, vals);

    const [[round]] = await pool.query(
      `SELECT id,course_name,DATE_FORMAT(date,'%Y-%m-%d') AS date,tee_time,status,notes
         FROM rounds WHERE id=?`, [id]
    );
    res.json({ data: round });
  } catch (e) { next(e); }
};

/* ---------- 삭제 ---------- */
// DELETE /api/rounds/:id
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM holes WHERE round_id=?', [id]);
    await pool.query('DELETE FROM rounds WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
};
