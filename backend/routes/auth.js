const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // ✅ 직접 연결한 mysql2 pool 사용

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);

    const [existing] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다' });
    }

    await pool.execute('INSERT INTO Users (email, password) VALUES (?, ?)', [email, hashed]);
    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ error: '로그인 실패' });
  }
});

module.exports = router;
