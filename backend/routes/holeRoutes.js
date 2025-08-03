// backend/routes/holeRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  createHolesHandler,
  getHolesHandler
} = require('../controllers/holeController');

// 홀 생성
router.post(
  '/rounds/:roundId/holes',
  auth,
  createHolesHandler
);

// 특정 라운드의 홀 조회
router.get(
  '/rounds/:roundId/holes',
  auth,
  getHolesHandler
);

module.exports = router;
