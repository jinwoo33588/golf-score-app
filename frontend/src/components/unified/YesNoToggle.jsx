// src/components/unified/YesNoToggle.jsx
import React from 'react';

export function YesNoToggle({ label, value = false, onChange, disabled = false }) {
  return (
    <div className={`gt-yesno ${disabled ? 'is-disabled' : ''}`}>
      {label && <div className="gt-yesno__label">{label}</div>}
      <div className="gt-yesno__buttons">
        <button
          type="button"
          className={`gt-ynbtn ${value ? 'active' : ''}`}
          onClick={() => !disabled && onChange && onChange(true)}
          disabled={disabled}
        >
          YES
        </button>
        <button
          type="button"
          className={`gt-ynbtn ${!value ? 'active' : ''}`}
          onClick={() => !disabled && onChange && onChange(false)}
          disabled={disabled}
        >
          NO
        </button>
      </div>
    </div>
  );
}

export function YesNoBadge({ value = false, yesText = 'YES', noText = 'NO' }) {
  return (
    <span className={`gt-ynbadge ${value ? 'yes' : 'no'}`}>
      {value ? yesText : noText}
    </span>
  );
}
