// backend/routes/holeRoutes.js
const router = require('express').Router();
const holeController = require('../controllers/holeController');
const { auth } = require('../middleware/auth');
const { assertHoleOwner, assertRoundOwner } = require('../utils/ownership');

// 단일 홀 수정
router.put('/holes/:holeId', auth, assertHoleOwner, holeController.updateOne);

// 벌크 업데이트(라운드 단위 저장)
router.put('/rounds/:id/holes', auth, assertRoundOwner, holeController.bulkUpdate);

module.exports = router;
