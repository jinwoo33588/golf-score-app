// backend/controllers/holeController.js
const { createHoles, getHolesByRound, updateHole, getHoleOwnerAndRound } = require('../models/holeModel');

// 홀들 벌크 생성
exports.createHolesHandler = async (req, res, next) => {
  try {
    const roundId = Number(req.params.roundId);
    const holesData = (req.body.holes ?? []).map(h => ({
      hole_number: Number(h.hole_number),
      par:         Number(h.par),
      score:       h.score    != null && h.score !== '' ? Number(h.score) : null,
      putts:       h.putts    != null && h.putts !== '' ? Number(h.putts) : null,
      gir:         Boolean(h.gir),
      fw_hit:      Boolean(h.fw_hit),
      penalties:   h.penalties != null ? Number(h.penalties) : 0
    }));
    const inserted = await createHoles(roundId, holesData);
    res.status(201).json({ inserted });
  } catch (err) {
    console.error('❌ createHolesHandler error:', err);
    next(err);
  }
};

// 라운드의 홀 조회
exports.getHolesHandler = async (req, res, next) => {
  try {
    const roundId = Number(req.params.roundId);
    const raw = await getHolesByRound(roundId);
    const holes = raw.map(h => ({
      ...h,
      gir: Boolean(h.gir),
      fw_hit: Boolean(h.fw_hit),
    }));
    res.json(holes);
  } catch (err) {
    next(err);
  }
};

// ✅ 개별 홀 업데이트
exports.updateHoleHandler = async (req, res, next) => {
  try {
    const holeId = Number(req.params.holeId);
    const userId = req.user.id; // 인증 미들웨어가 req.user 주입한다고 가정

    // 권한/존재 확인
    const info = await getHoleOwnerAndRound(holeId);
    if (!info) return res.status(404).json({ error: '해당 홀을 찾을 수 없습니다.' });
    if (info.user_id !== userId) return res.status(403).json({ error: '권한이 없습니다.' });

    // 허용 필드만 파싱
    const patch = {
      score:     req.body.score     != null ? Number(req.body.score) : null,
      putts:     req.body.putts     != null ? Number(req.body.putts) : null,
      gir:       Boolean(req.body.gir),
      fw_hit:    Boolean(req.body.fw_hit),
      penalties: req.body.penalties != null ? Number(req.body.penalties) : 0,
      notes:     req.body.notes ?? null,
    };

    const updated = await updateHole(holeId, patch);
    if (!updated) return res.status(400).json({ error: '수정된 내용이 없습니다.' });

    res.json({ updated }); // 필요하면 여기서 최신 레코드 다시 조회해 반환 가능
  } catch (err) {
    console.error('❌ updateHoleHandler error:', err);
    next(err);
  }
};
