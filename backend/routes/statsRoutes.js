// backend/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getSummary, getByCourse, getTrend } = require('../controllers/statsController');

router.get('/summary', auth, getSummary);
router.get('/by-course', auth, getByCourse);
router.get('/trend', auth, getTrend);

module.exports = router;
