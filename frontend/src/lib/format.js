export function numStr(n) {
  return n == null || Number.isNaN(n) ? '-' : String(n);
}
export function pctStr(n) {
  return n == null || Number.isNaN(n) ? '-' : `${Number(n).toFixed(1)}%`;
}
export function toParStr(n) {
  if (n == null || Number.isNaN(n)) return '-';
  const v = Number(n);
  return v > 0 ? `+${v}` : `${v}`;
}
