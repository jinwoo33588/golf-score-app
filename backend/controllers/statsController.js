// backend/controllers/statsController.js
const statsModel = require('../models/statsModel');

exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await statsModel.fetchSummary(userId);
    res.json(data);
  } catch (e) { next(e); }
};

exports.getByCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await statsModel.fetchByCourse(userId);
    res.json(data);
  } catch (e) { next(e); }
};

exports.getTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await statsModel.fetchTrend(userId);
    res.json(data);
  } catch (e) { next(e); }
};
