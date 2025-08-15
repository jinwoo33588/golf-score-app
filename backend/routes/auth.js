const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register); // body : { username, password, name }
router.post('/login', login);       // body : { username, password }
router.get('/me', auth, me);        // header: Authorizaation: Bearer <token>

module.exports = router;
