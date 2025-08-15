const {Router} = require('express'); // Express의 하위 라우터 생성용
const pool = require('../config/db'); // MySQL 데이터베이스 연결 풀

const router = Router(); // Express 라우터 인스턴스 생성. index.js에서 사용될 예정(api에 추가됨)

// GET /health 엔드포인트 정의
router.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok'); // 데이터베이스 연결 확인 쿼리 실행
    // DB 연결이 성공하면 응답 반환(rows[0].ok이 1이어야 함)
    res.json({ ok: true, db: rows[0]?.ok === 1 });
    // JSON 응답. ok: true는 서버가 정상 작동 중임을 나타내고, db: true는 DB 연결이 성공했음을 나타냄
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
    // 에러 발생 시 500 상태 코드와 함께 에러 메시지를 JSON 형태로 반환
  }

});


module.exports = router; // 라우터 모듈을 내보냄. index.js에서 사용될 예정(app.use('/api', router)
