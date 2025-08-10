// backend/routes/holeRoutes.js
const express = require('express');
const router = express.Router();
const { createHolesHandler, getHolesHandler, updateHoleHandler } = require('../controllers/holeController');
const auth = require('../middleware/authMiddleware'); // 로그인 필요 시

// 라운드 단위 생성/조회
router.post('/rounds/:roundId/holes', auth, createHolesHandler);
router.get('/rounds/:roundId/holes', auth, getHolesHandler);

// ✅ 개별 홀 수정
router.put('/holes/:holeId', auth, updateHoleHandler);

module.exports = router;
