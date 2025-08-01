// backend/controllers/roundController.js
const {
  createRound,
  getRoundsByUser,
  getRoundById,
  deleteRound
} = require('../models/roundModel');

exports.getRoundsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rounds = await getRoundsByUser(userId);
    res.json(rounds);
  } catch (err) {
    next(err);
  }
};

exports.createRoundHandler = async (req, res, next) => {
  try {
    console.log('▶ createRoundHandler body:', req.body);
    const userId = req.user.id;
    const { courseName, date, weather = '-' } = req.body;

    const roundId = await createRound(userId, courseName, date, weather);
    console.log('▶ createRoundHandler inserted roundId:', roundId);

    const round = await getRoundById(roundId);
    res.status(201).json({ round });
  } catch (err) {
    console.error('❌ createRoundHandler error:', err);
    next(err);
  }
};

exports.getRoundDetailHandler = async (req, res, next) => {
  try {
    const roundId = req.params.roundId;
    const userId = req.user.id;
    const round = await getRoundById(roundId);
    if (!round || round.user_id !== userId) {
      return res.status(404).json({ error: '해당 라운드를 찾을 수 없습니다.' });
    }

    const holes = await require('../models/holeModel').getHolesByRound(roundId);
    await Promise.all(holes.map(async hole => {
      const shots = await require('../models/shotModel').getShotsByHole(hole.id);
      hole.shots = shots;
    }));

    // 통계
    const totalScore = holes.reduce((sum, h) => sum + (h.score || 0), 0);
    const fir = holes.filter(h => h.fw_hit).length;
    const gir = holes.filter(h => h.gir).length;
    const putts = holes.reduce((sum, h) => sum + (h.putts || 0), 0);

    res.json({
      id: round.id,
      course_name: round.course_name,
      date: round.date,
      weather: round.weather,
      totalScore,
      fir,
      gir,
      putts,
      holes
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoundHandler = async (req, res, next) => {
  try {
    const roundId = req.params.roundId;
    console.log('▶ deleteRoundHandler roundId:', roundId);
    await deleteRound(roundId);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    next(err);
  }
};
