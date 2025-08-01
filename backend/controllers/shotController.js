// backend/controllers/shotController.js
const { createShots, getShotsByHole } = require('../models/shotModel');

exports.createShotsHandler = async (req, res, next) => {
  try {
    console.log('▶ createShotsHandler params:', req.params, 'body:', req.body);
    const count = await createShots(req.params.holeId, req.body.shots);
    console.log('▶ createShotsHandler inserted count:', count);
    res.status(201).json({ count });
  } catch (err) {
    console.error('❌ createShotsHandler error:', err);
    next(err);
  }
};

exports.getShotsHandler = async (req, res, next) => {
  try {
    const shots = await getShotsByHole(req.params.holeId);
    res.json(shots);
  } catch (err) {
    next(err);
  }
};
