// backend/controllers/statsController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getRoundStats, getUserOverview, getTrend } = require('../services/statsService');

exports.roundStats = asyncHandler(async (req, res) => {
  const roundId = Number(req.params.id);
  if (!Number.isInteger(roundId) || roundId <= 0) {
    const e = new Error('invalid round id'); e.status = 400; throw e;
  }
  const mode = String(req.query.mode || 'partial').toLowerCase();
  if (!['partial', 'strict'].includes(mode)) {
    const e = new Error('mode must be partial or strict'); e.status = 400; throw e;
  }

  const data = await getRoundStats({ roundId, userId: req.user.id, mode });
  res.json({ data });
});

exports.userOverview = asyncHandler(async (req, res) => {
  const { from = null, to = null } = req.query || {};
  const status = String(req.query.status || 'final').toLowerCase();
  if (!['final', 'draft', 'all'].includes(status)) {
    const e = new Error('status must be final, draft, or all'); e.status = 400; throw e;
  }

  const data = await getUserOverview({
    userId: req.user.id,
    from: from || null,
    to: to || null,
    status
  });
  res.json({ data });
});

exports.getTrend = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit ?? 10);
  const includeDraft = (req.query.includeDraft === 'true');
  const metric = String(req.query.metric || 'strokes'); // 필요시 사용
  const data = await getTrend({ userId: req.user.id, limit, includeDraft, metric });
  res.json(data); // { items: [...] }
});