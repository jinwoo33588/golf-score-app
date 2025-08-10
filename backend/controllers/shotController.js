const {
  createShots,
  getShotsByHole
} = require('../models/shotModel');

exports.createShotsHandler = async (req, res, next) => {
  try {
    const shotsArray = Array.isArray(req.body.shots)
      ? req.body.shots
      : [req.body];

    const inserted = await createShots(
      Number(req.params.holeId),
      shotsArray.map(s => ({
        shot_number:   s.shot_number,
        club:          s.club,
        condition:     s.condition,
        remaining_dist:s.remaining_dist,
        actual_dist:   s.actual_dist,
        result:        s.result,
        notes:         s.notes
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
