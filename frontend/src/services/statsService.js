// src/services/statsService.js (프론트용)
import { fetchRecentRounds } from './roundService';

const avg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length) : null;
const n = (v) => (v == null ? null : Number(v));
const onlyNums = (arr) => arr.map(n).filter((x)=> typeof x === 'number' && !Number.isNaN(x));

export async function fetchStatsSummary(limit = 5) {
  const rounds = await fetchRecentRounds(limit);

  const strokes = onlyNums(rounds.map(r => r.total_strokes));
  const putts   = onlyNums(rounds.map(r => r.total_putts));

  const firHit = rounds.reduce((a,r)=> a + Number(r.fir_hit_count || 0), 0);
  const firPos = rounds.reduce((a,r)=> a + Number(r.fir_possible   || 0), 0);
  const girHit = rounds.reduce((a,r)=> a + Number(r.gir_hit_count || 0), 0);
  const girPos = rounds.reduce((a,r)=> a + Number(r.gir_possible   || 0), 0);

  return {
    avgScore: strokes.length ? Number(avg(strokes).toFixed(1)) : null,
    avgPutts: putts.length   ? Number(avg(putts).toFixed(1))   : null,
    firPercent: firPos > 0 ? Math.round((firHit / firPos) * 100) : null,
    girPercent: girPos > 0 ? Math.round((girHit / girPos) * 100) : null,
  };
}
