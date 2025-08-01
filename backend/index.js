require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const dotenv      = require('dotenv');
const authRoutes  = require('./routes/auth');
const roundRoutes = require('./routes/roundRoutes');
const holeRoutes  = require('./routes/holeRoutes');
const shotRoutes  = require('./routes/shotRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 인증
app.use('/api', authRoutes);

// 각 리소스 라우터 연결
app.use('/api/rounds', roundRoutes);   // 라운드 CRUD
app.use('/api', holeRoutes);           // 홀 생성/조회
app.use('/api', shotRoutes);           // 샷 생성/조회

// 에러 핸들러
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
