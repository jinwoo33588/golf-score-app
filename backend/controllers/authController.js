const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// username 규칙(권장): 3~30, 영소문자/숫자/._-
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

async function register(req, res, next) {
  try {
    let { username, password, name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username/password required' });
    }

    username = String(username).trim().toLowerCase();
    name = name != null ? String(name).trim() : null;

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ message: 'invalid username format' });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'password too short (>=4)' });
    }

    const [dup] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
    if (dup.length) return res.status(409).json({ message: 'username already exists' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, name) VALUES (?,?,?)',
      [username, hash, name || null]
    );

    return res.status(201).json({ message: 'registered' });
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    let { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'username/password required' });

    username = String(username).trim().toLowerCase();

    const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name }
    });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    // 최신 name을 주기 위해 DB에서 다시 조회
    const [rows] = await pool.query('SELECT id, username, name FROM users WHERE id=?', [req.user.id]);
    const u = rows[0];
    if (!u) return res.status(404).json({ message: 'user not found' });
    res.json({ user: u });
  } catch (e) { next(e); }
}

module.exports = { register, login, me };
