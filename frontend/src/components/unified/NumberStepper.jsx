// src/components/unified/NumberStepper.jsx
import React from 'react';

export default function NumberStepper({
  label,
  value = 0,
  onChange,
  min = -999,
  max = 999,
  step = 1,
  allowTyping = false,
  disabled = false,
}) {
  const v = typeof value === 'number' && !Number.isNaN(value)
    ? value
    : Number(value) || 0;

  const clamp = (n) => Math.min(max, Math.max(min, n));
  const set = (n) => !disabled && onChange && onChange(clamp(n));

  return (
    <div className="gt-stepper">
      {label && <div className="gt-stepper__label">{label}</div>}
      <div className={`gt-stepper__ctrl ${disabled ? 'is-disabled' : ''}`}>
        <button type="button" onClick={() => set(v - step)} disabled={disabled}>-</button>
        {allowTyping ? (
          <input
            type="number"
            value={v}
            onChange={(e) => set(Number(e.target.value))}
            disabled={disabled}
          />
        ) : (
          <div className="gt-stepper__value">{v}</div>
        )}
        <button type="button" onClick={() => set(v + step)} disabled={disabled}>+</button>
      </div>
    </div>
  );
}
