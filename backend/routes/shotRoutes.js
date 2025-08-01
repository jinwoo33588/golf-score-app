const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const {
  createShotsHandler,
  getShotsHandler
} = require('../controllers/shotController');

// 샷 생성
router.post(
  '/holes/:holeId/shots',
  auth,
  createShotsHandler
);

// 특정 홀의 샷 조회
router.get(
  '/holes/:holeId/shots',
  auth,
  getShotsHandler
);

module.exports = router;
