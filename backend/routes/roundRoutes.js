// backend/routes/roundRoutes.js
const router = require('express').Router();
const roundController = require('../controllers/roundController');
const { auth } = require('../middleware/auth');
const { assertRoundOwner } = require('../utils/ownership');

// 목록
router.get('/rounds', auth, roundController.listMine);

// 생성
router.post('/rounds', auth, roundController.create);

// 상세
router.get('/rounds/:id', auth, assertRoundOwner, roundController.detail);

// 통계
router.get('/rounds/:id/stats', auth, assertRoundOwner, roundController.stats);

// 수정(메타/상태)
router.put('/rounds/:id', auth, assertRoundOwner, roundController.update);

// 삭제
router.delete('/rounds/:id', auth, assertRoundOwner, roundController.remove);

module.exports = router;
