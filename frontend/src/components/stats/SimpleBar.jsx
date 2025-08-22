// src/components/stats/SimpleBar.jsx
import './SimpleBar.css';

/**
 * 간단 바차트 (월별 등)
 * @param {{ data:{label:string, value:number}[], max?:number, height?:number }} props
 */
export default function SimpleBar({ data, max = null, height = 140 }) {
  const m = max ?? Math.max(1, ...data.map(d => Math.abs(d.value)));
  return (
    <div className="sbar" style={{ height }}>
      {data.map((d, idx) => {
        const h = Math.round((Math.abs(d.value) / m) * 100);
        const neg = d.value < 0;
        return (
          <div className="sbar__item" key={idx} title={`${d.label}: ${d.value}`}>
            <div className={`sbar__bar ${neg ? 'is-neg':''}`} style={{ height: `${h}%` }} />
            <div className="sbar__lbl">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
