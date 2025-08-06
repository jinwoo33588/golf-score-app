// src/utils/dateUtils.js
export function formatIsoDate(isoString) {
  return isoString.slice(0, 10);
}

export function formatKoreanDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}