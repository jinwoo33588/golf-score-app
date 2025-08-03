const { createHoles, getHolesByRound } = require('../models/holeModel');

exports.createHolesHandler = async (req, res, next) => {
  try {
    console.log('▶ Incoming holes payload:', req.body.holes);

    // 스키마에 맞추어 모든 필드를 파싱/보장
    const holesData = req.body.holes.map(h => ({
      hole_number: Number(h.hole_number),                 // schema: hole_number
      par:         Number(h.par),                         // schema: par
      score:       h.score    != null && h.score !== ''   // schema: score
                    ? Number(h.score)
                    : null,
      putts:       h.putts    != null && h.putts !== ''
                    ? Number(h.putts)
                    : null,
      gir:         Boolean(h.gir),                        // schema: gir
      fw_hit:      Boolean(h.fw_hit),                     // schema: fw_hit
      penalties:   h.penalties != null
                    ? Number(h.penalties)
                    : 0
    }));

    const inserted = await createHoles(
      Number(req.params.roundId),
      holesData
    );
    res.status(201).json({ inserted });
  } catch (err) {
    console.error('❌ createHolesHandler error:', err);
    next(err);
  }
};

exports.getHolesHandler = async (req, res, next) => {
  try {
    const raw = await getHolesByRound(Number(req.params.roundId));
    // Boolean 변환 포함
    const holes = raw.map(h => ({
      ...h,
      gir:     Boolean(h.gir),
      fw_hit:  Boolean(h.fw_hit)
    }));
    res.json(holes);
  } catch (err) {
    next(err);
  }
};
