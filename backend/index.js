require('dotenv').config(); // 환경 변수 로드
// .env 파일을 읽어 process.env에 주입. 맨 위에 있어야 아래에서 사용 가능
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
} 

const express = require('express');           // Express(서버) 프레임워크
const cors = require('cors');                 // 프론트(다른 포트) 접근 허용
const morgan = require('morgan');             // HTTP 요청 로깅 미들웨어
const { pool } = require('./config/db');      // MySQL 연결 풀 설정 불러오기

const healthRouter = require('./routes/health');      // 헬스 체크 라우터 불러오기
const authRouter = require('./routes/auth');          // 인증 관련 라우터 불러오기

const app = express();                                // Express 앱 인스턴스 생성

app.use(morgan('dev'));                               // HTTP 요청 로깅 설정 "GET /api/health 200 10ms - 20b" 같은 로그 출력
app.use(express.json());                              // JSON 요청 본문 파싱 미들웨어. req.body에 객체로 들어옴

app.use(cors({
  origin: 'http://localhost:3000',// 프론트엔드 개발 서버 주소]
  credentials: true, // 쿠키를 포함한 요청 허용
}));
// CORS 설정. 프론트엔드 개발 서버에서 오는 요청을 허용(VITE 기본 5173, CRA/개발자 선호 3000 사용)
// credentials: JWT 쿠키 등을 쓸 때 true 필요

// (선택) 필수 ENV 가드
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
}

// (선택) DB 연결 테스트
pool.getConnection().then(c => c.release()).catch(console.error);


// 라우터 설정
app.use('/api', healthRouter);            // /api 경로로 헬스 체크 라우터 사용. "/api"라는 prefix로 하위 라우터 장착 → 실제 경로는 /api/health
app.use('/api/auth', authRouter);         // /api/auth 경로로 인증 관련 라우터 사용. "/api/auth"라는 prefix로 하위 라우터 장착 → 실제 경로는 /api/auth/register, /api/auth/login 등


// 404 에러 처리. 잘못된 경로로 요청이 들어오면 "Not Found" 응답(순서 중요: 마지막에 둬야됨)
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));



// 서버 실행 시작. listen 콜백은 정상 기동 시점에 1번 로그만 출력
const PORT = process.env.PORT || 4000; // .env PORT 없으면 4000
app.listen(PORT, () => {
  console.log(`✅ Backend on http://localhost:${PORT}`);
});
