// backend/index.js
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const authRoutes   = require('./routes/auth');
const roundRoutes  = require('./routes/roundRoutes');
const holeRoutes   = require('./routes/holeRoutes');
const shotRoutes   = require('./routes/shotRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors()); // 쿠키 인증 쓰면 { origin:'http://localhost:3000', credentials:true }로
app.use(express.json());

// ===== API 라우트 =====
app.use('/api', authRoutes);           // 인증
app.use('/api/rounds', roundRoutes);   // 라운드 CRUD
app.use('/api', holeRoutes);           // 홀 생성/조회
app.use('/api', shotRoutes);           // 샷 생성/조회
app.use('/api/stats', statsRoutes);    // 통계 관련

// 존재하지 않는 API 404 (선택)
app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API route not found' });
});

// ===== 프론트 정적 서빙 + SPA Fallback (프로덕션용) =====
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../frontend/build');

  // 정적 파일(css/js) 서빙
  app.use(express.static(clientBuildPath));

  // API가 아닌 모든 경로는 index.html 반환 → BrowserRouter 새로고침 대응
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next(); // API는 통과
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // 개발 모드에선 간단한 헬스 체크
  app.get('/', (req, res) => res.send('API server running (dev).'));
}

// 에러 핸들러 (맨 마지막)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
