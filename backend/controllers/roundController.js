const pool = require('../config/db');

// 숫자 필드를 안전하게 변환하는 유틸 함수
const safeInt = (val) => {
  return val === '' || val === undefined ? null : Number(val);
};

exports.createRound = async (req, res) => {
  const { course, date, holes } = req.body;
  const userId = req.user.id;

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    if (!userId || !course || !date) {
      return res.status(400).json({ error: '필수 데이터 누락' });
    }

    // 라운드 저장
    const [roundResult] = await conn.execute(
      'INSERT INTO Rounds (userId, course, date) VALUES (?, ?, ?)',
      [userId, course, date]
    );
    const roundId = roundResult.insertId;

    // 홀 데이터 저장
    for (const hole of holes) {
      const { holeNumber, par, score, teeshot, approach, putts, gir } = hole;

      await conn.execute(
        `INSERT INTO RoundHoles (roundId, holeNumber, par, score, teeshot, approach, putts, gir)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          roundId,
          safeInt(holeNumber),
          safeInt(par),
          safeInt(score),
          teeshot || null,
          approach || null,
          safeInt(putts),
          gir ?? null
        ]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ message: '라운드 저장 완료' });
  } catch (err) {
    console.error('❌ 라운드 저장 오류:', err);
    res.status(500).json({ error: '라운드 저장 실패' });
    console.log('userId:', userId, 'course:', course, 'date:', date);
  }
};

exports.getRounds = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      'SELECT id, course, date FROM Rounds WHERE userId = ? ORDER BY date DESC',
      [userId]
    );

    // 총 스코어 계산 추가 (필요 시)
    const roundsWithScore = await Promise.all(rows.map(async round => {
      const [holes] = await pool.execute(
        'SELECT score FROM RoundHoles WHERE roundId = ?',
        [round.id]
      );
      const totalScore = holes.reduce((sum, h) => sum + (h.score || 0), 0);
      return { ...round, score: totalScore };
    }));

    res.json(roundsWithScore);
  } catch (err) {
    console.error('❌ 라운드 목록 불러오기 오류:', err);
    res.status(500).json({ error: '라운드 목록 불러오기 실패' });
  }
};

exports.getRoundById = async (req, res) => {
  const { id } = req.params;
  try {
    const [roundRows] = await pool.execute(
      'SELECT * FROM Rounds WHERE id = ? AND userId = ?', [id, req.user.id]
    );
    if (roundRows.length === 0) return res.status(404).json({ error: '라운드 없음' });

    const round = roundRows[0];

    const [holeRows] = await pool.execute(
      'SELECT * FROM RoundHoles WHERE roundId = ?', [id]
    );

    const totalScore = holeRows.reduce((sum, h) => sum + (h.score || 0), 0);
    const fir = Math.round(
      (holeRows.filter(h => h.teeshot === '페어웨이').length / 18) * 100
    );
    const gir = Math.round(
      (holeRows.filter(h => h.gir === 1).length / 18) * 100
    );
    const putts = holeRows.reduce((sum, h) => sum + (h.putts || 0), 0);

    res.json({
      id: round.id,
      course: round.course,
      date: round.date,
      score: totalScore,
      fir,
      gir,
      putts,
      holes: holeRows
    });
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err);
    res.status(500).json({ error: '상세 조회 실패' });
  }
};

exports.deleteRound = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.execute('DELETE FROM RoundHoles WHERE roundId = ?', [id]);
    await conn.execute('DELETE FROM Rounds WHERE id = ? AND userId = ?', [id, req.user.id]);

    await conn.commit();
    conn.release();

    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('❌ 라운드 삭제 실패:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
};
