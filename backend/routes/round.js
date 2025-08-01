// backend/routes/round.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRounds, createRound, getRoundById, deleteRound } = require('../controllers/roundController');

router.get('/', authMiddleware, getRounds);
router.post('/', authMiddleware, createRound);
router.delete('/:id', authMiddleware, deleteRound); // 삭제
router.get('/:id', authMiddleware, getRoundById); // 상세 조회

module.exports = router;
