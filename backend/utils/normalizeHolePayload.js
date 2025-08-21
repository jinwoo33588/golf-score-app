function normalizeHolePayload(body) {
  const out = { ...body };

  // 빈 문자열 → NULL
  for (const k of ['score', 'putts', 'penalties', 'fir', 'gir']) {
    if (out[k] === '' || out[k] === undefined) out[k] = null;
  }

  // 숫자 변환 + 범위 가드
  if (out.score != null) out.score = Math.max(-5, Math.min(5, Number(out.score)));
  if (out.putts != null) out.putts = Math.max(0, Math.min(6, Number(out.putts)));
  if (out.penalties != null) out.penalties = Math.max(0, Math.min(9, Number(out.penalties)));

  // fir/gir은 0/1/NULL만
  for (const k of ['fir', 'gir']) {
    if (out[k] != null && ![0, 1, '0', '1'].includes(out[k])) out[k] = null;
    if (out[k] === '0') out[k] = 0;
    if (out[k] === '1') out[k] = 1;
  }

  // par=3이면 FIR 무의미 → NULL 강제
  if (Number(out.par) === 3) out.fir = null;

  return out;
}

module.exports = { normalizeHolePayload };
