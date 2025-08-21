import './NumberStepper.css';

/**
 * NumberStepper
 * - value: number|null
 * - onChange: (v:number|null)=>void
 * - min, max: 범위
 * - initial: 처음 클릭했을 때 스냅할 시작값(없으면 min)
 * - behavior: 'snap' | 'offset'
 *    - 'snap'   : null 상태에서 처음 클릭하면 initial로 "딱" 들어감 (기본)
 *    - 'offset' : null 상태에서 [+]는 initial, [-]는 initial-1 로 시작 (선호 시 사용)
 */
export default function NumberStepper({
  value,
  onChange,
  min,
  max,
  initial = null,
  behavior = 'snap',
}) {
  const clamp = (n) => Math.max(min, Math.min(max, n));

  const setInitialBy = (dir /* 'inc' | 'dec' */) => {
    const base = clamp(initial == null ? min : Number(initial));
    if (behavior === 'offset') {
      const delta = dir === 'dec' ? -1 : 0;
      onChange(clamp(base + delta));
    } else {
      onChange(base);
    }
  };

  const dec = () => {
    if (value == null) return setInitialBy('dec');
    onChange(clamp(value - 1));
  };
  const inc = () => {
    if (value == null) return setInitialBy('inc');
    onChange(clamp(value + 1));
  };
  const clr = () => onChange(null);

  const show = value ?? '-';

  return (
    <div className="stepper">
      <button type="button" className="stepper__btn" onClick={dec} aria-label="decrement">-</button>
      <div className="stepper__val" aria-live="polite">{show}</div>
      <button type="button" className="stepper__btn" onClick={inc} aria-label="increment">+</button>
      <button type="button" className="stepper__clr" onClick={clr}>clr</button>
    </div>
  );
}
