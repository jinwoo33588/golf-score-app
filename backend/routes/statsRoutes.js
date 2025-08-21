const router = require('express').Router();
const statsController = require('../controllers/statsController');

// 라운드 단일 통계
// GET /api/rounds/:id/stats?mode=partial|strict
router.get('/rounds/:id/stats', statsController.roundStats);

// 유저 기간 개요 통계
// GET /api/stats/overview?from=YYYY-MM-DD&to=YYYY-MM-DD&status=final|draft|all
router.get('/stats/overview', statsController.userOverview);

module.exports = router;
