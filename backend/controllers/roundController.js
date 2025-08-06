const {
  createRound,
  getRoundsByUserWithStats,
  getRoundWithStats,
  deleteRound
} = require('../models/roundModel');
const { getHolesByRound }  = require('../models/holeModel');
const { getShotsByHole }   = require('../models/shotModel');

exports.getRoundsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rounds = await getRoundsByUserWithStats(userId);
    console.log('▶ getRoundsHandler 결과:', rounds);
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

    // 1) rounds 테이블에 insert
    const roundId = await createRound(userId, courseName, date, weather);
    console.log('▶ createRoundHandler inserted roundId:', roundId);

    // 2) stats 포함된 round 정보 조회
    const round = await getRoundWithStats(roundId);

    // 3) 프론트가 기대하는 형식: { round: { … } }
    res.status(201).json({ round });
  } catch (err) {
    console.error('❌ createRoundHandler error:', err);
    next(err);
  }
};

exports.getRoundDetailHandler = async (req, res, next) => {
  try {
    // 라우터에서 :roundId 로 잡았다면 아래처럼
    const roundId = Number(req.params.roundId);
    const userId  = req.user.id;

    // 기본 라운드+통계 정보
    const round = await getRoundWithStats(roundId);
    if (!round || round.user_id !== userId) {
      return res.status(404).json({ error: '해당 라운드를 찾을 수 없습니다.' });
    }

    // holes + shots
    const holes = await getHolesByRound(roundId);
    const holesWithShots = await Promise.all(
      holes.map(async h => ({
        ...h,
        gir: Boolean(h.gir),                   // 불러온 gir TINYINT → boolean
        shots: await getShotsByHole(h.id)      // shots 테이블 전체 컬럼 포함
      }))
    );

    // 프론트가 기대하는 형식: { …round, holes: […] }
    res.json({ ...round, holes: holesWithShots });
  } catch (err) {
    console.error('❌ getRoundDetailHandler error:', err);
    next(err);
  }
};

exports.deleteRoundHandler = async (req, res, next) => {
  try {
    const roundId = Number(req.params.roundId);
    console.log('▶ deleteRoundHandler roundId:', roundId);
    await deleteRound(roundId);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    next(err);
  }
};
