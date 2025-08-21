// src/components/ui/TriStateToggle.jsx
import './TriStateToggle.css';

/**
 * TriState 토글
 * @param {{
 *  value: 0|1|null,
 *  onChange: (v:0|1|null)=>void,
 *  disabled?: boolean,
 *  order?: Array<0|1|null>,             // 버튼 순서 (기본: [null,1,0])
 *  labels?: Partial<Record<'1'|'0'|'null', string>> // 라벨 커스터마이즈
 * }} props
 */
export default function TriStateToggle({
  value,
  onChange,
  disabled = false,
  order = [null, 1, 0],
  labels = { '1': 'Y', '0': 'N', 'null': '-' },
}) {
  return (
    <div className={`tri ${disabled ? 'tri--disabled' : ''}`}>
      {order.map((o) => {
        const key = String(o); // '1' | '0' | 'null'
        const text = labels[key];
        const active = value === o || (o === null && value === null);
        return (
          <button
            key={key}
            type="button"
            className={`tri__btn ${active ? 'is-active' : ''}`}
            onClick={() => !disabled && onChange(o)}
            disabled={disabled}
            aria-pressed={active}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
