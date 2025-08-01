// backend/routes/roundRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  getRoundsHandler,
  createRoundHandler,
  getRoundDetailHandler,
  deleteRoundHandler
} = require('../controllers/roundController');

// 라운드 목록
router.get( '/',      auth, getRoundsHandler);
// 라운드 생성
router.post('/',      auth, createRoundHandler);
// 상세 조회
router.get( '/:roundId', auth, getRoundDetailHandler);
// 삭제
router.delete('/:roundId', auth, deleteRoundHandler);

module.exports = router;
