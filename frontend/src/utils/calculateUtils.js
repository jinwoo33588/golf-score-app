// src/utils/calculateUtils.js
export function sumScores(holes) {
  return holes.reduce((acc, h) => acc + Number(h.score || 0), 0);
}

export function calculateFirRate(holes) {
  const hit = holes.filter(h => h.fw_hit).length;
  return holes.length ? (hit / holes.length) * 100 : 0;
}

export function calculateGirRate(holes) {
  const gir = holes.filter(h => h.gir).length;
  return holes.length ? (gir / holes.length) * 100 : 0;
}