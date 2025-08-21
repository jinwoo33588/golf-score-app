import './MetricTile.css';

/**
 * MetricTile
 *  - label: 라벨
 *  - value: 값 (null/undefined면 '-' 표시)
 *  - mode : 'num' | 'pct' | 'par'
 *  - accent: 'blue' | 'green' | 'amber' | 'red' | 'gray'
 *  - size : 'md' | 'sm'
 *  - hint : 보조 텍스트(선택)
 */
export default function MetricTile({
  label,
  value,
  mode = 'num',
  accent = 'gray',
  size = 'md',
  hint = '',
}) {
  const text = format(value, mode);
  const pct = mode === 'pct' ? clamp(Number(value)) : null;

  return (
    <div className={`mt mt--${accent} mt--${size}`} aria-label={label}>
      <div className="mt__label">{label}</div>
      <div className="mt__value">{text}</div>
      {mode === 'pct' && (
        <div className="mt__bar" role="progressbar" aria-valuenow={pct ?? 0} aria-valuemin={0} aria-valuemax={100}>
          <div className="mt__fill" style={{ width: `${pct ?? 0}%` }} />
        </div>
      )}
      {hint ? <div className="mt__hint">{hint}</div> : null}
    </div>
  );
}

function format(n, mode) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  if (mode === 'pct') return `${Number(n).toFixed(1)}%`;
  if (mode === 'par') return Number(n) > 0 ? `+${n}` : `${n}`;
  return String(n);
}

function clamp(v) {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 100) return 100;
  return v;
}
