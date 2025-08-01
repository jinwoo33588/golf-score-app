// backend/controllers/holeController.js
const { createHoles, getHolesByRound } = require('../models/holeModel');

exports.createHolesHandler = async (req, res, next) => {
  try {
    console.log('▶ createHolesHandler params:', req.params, 'body:', req.body);
    const count = await createHoles(req.params.roundId, req.body.holes);
    console.log('▶ createHolesHandler inserted count:', count);
    res.status(201).json({ count });
  } catch (err) {
    console.error('❌ createHolesHandler error:', err);
    next(err);
  }
};

exports.getHolesHandler = async (req, res, next) => {
  try {
    const holes = await getHolesByRound(req.params.roundId);
    res.json(holes);
  } catch (err) {
    next(err);
  }
};
