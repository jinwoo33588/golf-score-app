const { createShots, getShotsByHole } = require('../models/shotModel');

exports.createShotsHandler = async (req, res, next) => {
  try {
    console.log('▶ createShotsHandler params:', req.params, 'body:', req.body);

    // 1) API 사용 패턴에 맞춰, 배열로 들어올 수도/단일로 들어올 수도 처리
    const shotsArray = Array.isArray(req.body.shots)
      ? req.body.shots
      : [req.body];

    const inserted = await createShots(
      Number(req.params.holeId),
      shotsArray.map(s => ({
        shot_number:    Number(s.shot_number),
        club:           s.club           || '-',
        start_location: s.start_location || '-',
        end_location:   s.end_location   || '-',
        distance:       s.distance != null ? Number(s.distance) : null,
        result:         s.result         || '-',
        lie:            s.lie            || '-',
        notes:          s.notes || null
      }))
    );
    res.status(201).json({ inserted });
  } catch (err) {
    console.error('❌ createShotsHandler error:', err);
    next(err);
  }
};

exports.getShotsHandler = async (req, res, next) => {
  try {
    const shots = await getShotsByHole(Number(req.params.holeId));
    res.json(shots);
  } catch (err) {
    next(err);
  }
};
