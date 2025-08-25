// src/services/statsService.js
import axios from '../lib/axiosInstance';
import { fetchRecentRounds } from './roundService'; // trend 404 폴백용

const unwrap = (res) => (res?.data?.data ?? res?.data ?? null);

/** 개요 통계 */
export async function fetchStatsSummary(
  params = { from: null, to: null, status: 'final' },
  options = {} // { signal } 등 axios config
) {
  const res = await axios.get('/stats/overview', { ...options, params });
  return unwrap(res); // { rounds_count, avg_strokes, avg_score, ... }
}

/** 라운드 단일 통계 */
export async function fetchRoundStats(
  roundId,
  mode = 'partial',
  options = {}
) {
  if (!roundId) throw new Error('roundId required');
  const res = await axios.get(`/rounds/${roundId}/stats`, { ...options, params: { mode } });
  return unwrap(res); // { round_id, total_strokes, ... }
}

/** 추세 */
export async function fetchTrend(
  params = { limit: 8, includeDraft: false },
  options = {}
) {
  try {
    const res = await axios.get('/stats/trend', { ...options, params });
    return unwrap(res) ?? { items: [] };
  } catch (e) {
    if (e?.response?.status === 404) {
      // 백엔드 라우트 생기기 전 임시 폴백
      const rounds = await fetchRecentRounds(params.limit ?? 8);
      const items = (rounds || []).map((r) => ({
        round_id: r.id,
        date: r.date,
        course_name: r.course_name,
        strokes: r.total_strokes ?? null,
        score:
          typeof r.total_score === 'number' ? r.total_score :
          typeof r.to_par === 'number'       ? r.to_par :
          typeof r.score === 'number'        ? r.score : null,
        putts: r.putts_total ?? null,
        fir_pct: (typeof r.fir_pct === 'number')
          ? r.fir_pct
          : (r.fir_possible ? Math.round(((r.fir_hit_count ?? 0) / r.fir_possible) * 1000) / 10 : null),
        gir_pct: (typeof r.gir_pct === 'number')
          ? r.gir_pct
          : (r.gir_possible ? Math.round(((r.gir_hit_count ?? 0) / r.gir_possible) * 1000) / 10 : null),
      }));
      return { items };
    }
    throw e;
  }
}
