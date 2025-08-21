import './StatChip.css';

/** mode: 'num'|'pct'|'par' */
export default function StatChip({ label, value, mode='num' }){
  const text = format(value, mode);
  return (
    <div className="chip">
      <div className="chip__label">{label}</div>
      <div className="chip__value">{text}</div>
    </div>
  );
}

function format(n, mode){
  if(n===null || n===undefined || Number.isNaN(n)) return '-';
  if(mode==='pct') return `${Number(n).toFixed(1)}%`;
  if(mode==='par') return Number(n)>0? `+${n}` : `${n}`;
  return String(n);
}
