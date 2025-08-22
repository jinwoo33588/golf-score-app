// src/hooks/useAnalytics.js
import axiosInstance from '../lib/axiosInstance'; 

const api = axiosInstance;

/** 라운드 목록 (status=final 권장) */
export async function listRounds({ status = 'final', from = null, to = null, q = '' } = {}) {
  const params = {};
  if (status && status !== 'all') params.status = status;
  if (from) params.from = from;
  if (to) params.to = to;
  if (q) params.q = q;
  const res = await api.get('/rounds', { params });
  return res.data?.data || [];
}

/** 단일 라운드 상세(holes 포함) */
export async function getRoundDetail(rid) {
  const res = await api.get(`/rounds/${rid}`);
  return res.data?.data || null; // { round, holes }
}

/** v0: 프론트에서 전체 집계 */
export async function buildAnalytics({ status = 'final', from = null, to = null, q = '' } = {}) {
  const rounds = await listRounds({ status, from, to, q });

  // 라운드별 holes를 전부 로드
  const details = await Promise.all(
    rounds.map(r => getRoundDetail(r.id))
  );

  // 합산용 누적기
  const acc = {
    rounds: 0,
    holes: 0,
    toParSum: 0,
    strokesSum: 0,

    puttsSum: 0, puttsDen: 0,

    firHit: 0, firDen: 0,
    girHit: 0, girDen: 0,

    threePutts: 0, threeDen: 0,
    dblPlus: 0, scoreDen: 0,

    penaltiesSum: 0,

    dist: { eagle: 0, birdie: 0, par: 0, bogey: 0, double_plus: 0 },

    byMonth: new Map(),   // 'YYYY-MM' -> { rounds, toParSum }
    byCourse: new Map(),  // course_name -> { rounds, toParSum }
  };

  for (const d of details) {
    if (!d) continue;
    const { round, holes } = d;
    acc.rounds += 1;

    // 월, 코스 스플릿 키
    const ym = (round.date || '').slice(0, 7); // 'YYYY-MM'
    const course = round.course_name || 'Unknown';

    let roundToPar = 0;

    for (const h of holes) {
      const { par, score, putts, penalties, fir, gir, hole_number } = h;

      // 점수/타수 합
      if (par != null && score != null) {
        const strokes = par + score;
        acc.strokesSum += strokes;
        roundToPar += score;
        acc.holes += 1;
        acc.scoreDen += 1;

        // 분포
        if (score <= -2) acc.dist.eagle++;
        else if (score === -1) acc.dist.birdie++;
        else if (score === 0) acc.dist.par++;
        else if (score === 1) acc.dist.bogey++;
        else if (score >= 2) { acc.dist.double_plus++; acc.dblPlus++; }
      }

      // 퍼팅
      if (putts != null) {
        acc.puttsSum += putts; acc.puttsDen++;
        acc.threeDen++; if (putts >= 3) acc.threePutts++;
      }

      // 패널티
      if (penalties != null) acc.penaltiesSum += penalties;

      // FIR (par 3 제외)
      if (par !== 3 && fir != null) {
        acc.firDen++; if (fir === 1) acc.firHit++;
      }

      // GIR
      if (gir != null) {
        acc.girDen++; if (gir === 1) acc.girHit++;
      }
    }

    // 스플릿 누적
    acc.toParSum += roundToPar;

    if (ym) {
      const cur = acc.byMonth.get(ym) || { rounds: 0, toParSum: 0 };
      cur.rounds += 1; cur.toParSum += roundToPar;
      acc.byMonth.set(ym, cur);
    }
    const c = acc.byCourse.get(course) || { rounds: 0, toParSum: 0 };
    c.rounds += 1; c.toParSum += roundToPar;
    acc.byCourse.set(course, c);
  }

  // 최종 지표
  const summary = {
    rounds: acc.rounds,
    holes: acc.holes,
    to_par_total: acc.toParSum,
    strokes_total: acc.strokesSum,

    putts_total: acc.puttsSum,
    putts_avg: acc.puttsDen ? +(acc.puttsSum / acc.puttsDen).toFixed(2) : null,

    fir_pct: acc.firDen ? +(100 * acc.firHit / acc.firDen).toFixed(1) : null,
    gir_pct: acc.girDen ? +(100 * acc.girHit / acc.girDen).toFixed(1) : null,

    three_putt_rate: acc.threeDen ? +(100 * acc.threePutts / acc.threeDen).toFixed(1) : null,
    double_or_worse_rate: acc.scoreDen ? +(100 * acc.dblPlus / acc.scoreDen).toFixed(1) : null,

    penalties_total: acc.penaltiesSum,

    dist: acc.dist,

    // 월별: 평균 to-par (라운드 합/라운드 수)
    trend: Array.from(acc.byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, avg_to_par: +(v.toParSum / v.rounds).toFixed(2), rounds: v.rounds })),

    // 코스 스플릿: 상위 8개
    courses: Array.from(acc.byCourse.entries())
      .map(([course, v]) => ({ course, avg_to_par: +(v.toParSum / v.rounds).toFixed(2), rounds: v.rounds }))
      .sort((a, b) => Math.abs(a.avg_to_par) - Math.abs(b.avg_to_par))
      .slice(0, 8),
  };

  return { rounds, summary };
}
