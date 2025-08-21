// src/components/holes/HoleView.jsx
import './HoleView.css';

/**
 * 읽기 전용 홀 카드
 * @param {{ hole: any }} props
 */
export default function HoleView({ hole }) {
  const strokes = (hole?.par != null && hole?.score != null) ? (hole.par + hole.score) : null;
  const yn = (v) => v == null ? '-' : (v ? 'Y' : 'N');
  const plus = (n) => n == null ? '-' : (n > 0 ? `+${n}` : `${n}`);

  return (
    <div className="holev">
      <div className="holev__head">
        <div className="holev__title">Hole {hole.hole_number}</div>
        <div className="holev__par">Par {hole.par ?? '-'}</div>
      </div>

      <div className="holev__grid">
        <LabelVal label="Score(±)" value={plus(hole.score)} />
        <LabelVal label="Strokes"  value={strokes == null ? '-' : strokes} />
        <LabelVal label="Putts"    value={hole.putts ?? '-'} />
        <LabelVal label="Penalties" value={hole.penalties ?? '-'} />
        <LabelVal label="FIR" value={yn(hole.par === 3 ? null : hole.fir)} />
        <LabelVal label="GIR" value={yn(hole.gir)} />
      </div>

      {hole.notes ? <div className="holev__notes">{hole.notes}</div> : null}
    </div>
  );
}

function LabelVal({ label, value }) {
  return (
    <div className="lv">
      <div className="lv__label">{label}</div>
      <div className="lv__value">{value}</div>
    </div>
  );
}
