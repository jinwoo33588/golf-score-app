// src/components/unified/StatChip.jsx
import React from 'react';
import '../unified/unified.css';

export default function StatChip({
  label,
  mode = 'view',                 // 'view' | 'edit'
  variant = 'number',             // 'number' | 'toggle'
  value,
  onChange,
  min = 0,
  max = 10,
  scoreColors = false,            // number 변형이 'Score(±)'처럼 색상(+/0/-) 쓸지
  yesText = 'Yes',
  noText = 'No',
  naText = '-',
}) {
  const editable = mode !== 'view';

  // 안전 숫자 처리
  const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
  const clamp = (v) => Math.max(min, Math.min(max, n(v)));

  // ====== EDIT MODE ======
  if (editable) {
    if (variant === 'toggle') {
      const state = value === true ? 'yes' : value === false ? 'no' : 'na';
      return (
        <div className="gt-statcard is-edit">
          <div className="gt-chip-title">{label}</div>
          <div className="gt-chip-seg">
            <button
              type="button"
              className={`seg ${state === 'yes' ? 'active yes' : ''}`}
              onClick={() => onChange?.(true)}
            >
              {yesText}
            </button>
            <button
              type="button"
              className={`seg ${state === 'na' ? 'active na' : ''}`}
              onClick={() => onChange?.(null)}
            >
              {naText}
            </button>
            <button
              type="button"
              className={`seg ${state === 'no' ? 'active no' : ''}`}
              onClick={() => onChange?.(false)}
            >
              {noText}
            </button>
          </div>
        </div>
      );
    }

    // variant === 'number'
    return (
      <div className="gt-statcard is-edit">
        <div className="gt-chip-title">{label}</div>
        <div className="gt-chip-ctrl">
          <button
            type="button"
            className="gt-chip-btn"
            onClick={() => onChange?.(clamp(n(value) - 1))}
          >
            −
          </button>
          <div className="gt-chip-num">{n(value)}</div>
          <button
            type="button"
            className="gt-chip-btn"
            onClick={() => onChange?.(clamp(n(value) + 1))}
          >
            ＋
          </button>
        </div>
      </div>
    );
  }

  // ====== VIEW MODE ======
  if (variant === 'toggle') {
    const state = value === true ? 'ok' : value === false ? 'no' : 'na';
    const text  = value === true ? yesText : value === false ? noText : naText;
    return (
      <div className={`gt-statcard toggle ${state}`}>
        <div className="gt-chip-title">{label}</div>
        <div className="gt-chip-value">{text}</div>
      </div>
    );
  }

  // number (scoreColors 처리 포함)
  const v = Number.isFinite(Number(value)) ? Number(value) : null;
  const relLabel = v == null ? '-' : v > 0 ? `+${v}` : `${v}`;
  const relClass = v == null ? '' : v < 0 ? 'good' : v > 0 ? 'bad' : 'neutral';

  return (
    <div className="gt-statcard">
      <div className="gt-chip-title">{label}</div>
      <div className={`gt-chip-value ${scoreColors ? relClass : ''}`}>
        {scoreColors ? relLabel : (value ?? '-')}
      </div>
    </div>
  );
}
