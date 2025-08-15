const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'no token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // 토큰에는 id, username만 담아둠(이름은 변경될 수 있으니 /me에서 DB조회)
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'invalid token' });
  }
}

module.exports = { auth };
