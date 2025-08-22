import axiosInstance from '../lib/axiosInstance';

// 공통 파서: 배열 찾아서 꺼내기
function pickList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;        // ✅ 너의 응답 형태
  if (Array.isArray(payload?.rounds)) return payload.rounds;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
function pickHoles(payload) {
  const cands = [
    payload?.holes,
    payload?.data?.holes,          // ✅ 단건 { data: {..., holes: []} } 대응
    payload?.round?.holes,
    payload?.data?.round?.holes,
  ];
  for (const c of cands) if (Array.isArray(c)) return c;
  return [];
}
const isFinal = (s) => typeof s === 'string' && s.toLowerCase() === 'final';

// ---- 집계 유틸 ----
function computeAggregates(holes = []) {
  let total_strokes = 0;
  let total_putts = 0;
  let to_par_sum = 0;
  let fir_hit_count = 0, fir_possible = 0;
  let gir_hit_count = 0, gir_possible = 0;

  for (const h of holes) {
    const par = h?.par, score = h?.score, putts = h?.putts;
    if (par != null && score != null) {
      total_strokes += (par + score);
      to_par_sum += score;
    }
    if (putts != null) total_putts += putts;

    if (par === 4 || par === 5) {
      if (h?.fir !== null && h?.fir !== undefined) {
        fir_possible += 1;
        if (Number(h.fir) === 1) fir_hit_count += 1;
      }
    }
    if (h?.gir !== null && h?.gir !== undefined) {
      gir_possible += 1;
      if (Number(h.gir) === 1) gir_hit_count += 1;
    }
  }
  return { total_strokes, total_putts, to_par_sum, fir_hit_count, fir_possible, gir_hit_count, gir_possible };
}

// 단일 라운드 holes 로드(여러 형태 대응)
async function fetchRoundHoles(roundId) {
  try {
    const res = await axiosInstance.get(`/rounds/${roundId}`);
    return pickHoles(res.data);
  } catch {
    return [];
  }
}

/**
 * 홈 전용: 최근 final 라운드 N개
 * - 새 엔드포인트 없이 /rounds만 사용
 * - 응답이 {data:[...]} 형태여도 안전하게 파싱
 * - 집계필드 없으면 holes 불러와 클라에서 계산
 */
export async function fetchRecentRounds(limit = 5) {
  const res = await axiosInstance.get('/rounds');
  const list = pickList(res.data);

  const finals = list.filter(r => isFinal(r?.status));

  const sorted = finals
    .sort((a, b) => {
      const da = new Date(a.date), db = new Date(b.date);
      const diff = db - da;
      if (diff !== 0) return diff;
      if (typeof b.id === 'number' && typeof a.id === 'number') return b.id - a.id;
      return 0;
    })
    .slice(0, limit);

  const enriched = await Promise.all(sorted.map(async (r) => {
    const hasAgg =
      r.total_strokes != null &&
      r.total_putts != null &&
      r.to_par_sum != null;

    if (hasAgg) return r;

    const holes = Array.isArray(r.holes) ? r.holes : await fetchRoundHoles(r.id);
    const agg = computeAggregates(holes);
    return { ...r, ...agg };
  }));

  return enriched;
}
