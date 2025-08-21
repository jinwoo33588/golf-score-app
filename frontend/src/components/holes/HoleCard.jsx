import './HoleCard.css';
import NumberStepper from '../ui/NumberStepper.jsx';
import TriStateToggle from '../ui/TriStateToggle.jsx';
import { RANGES } from '../../config/ranges.js';

/**
 * 편집용 홀 카드 (LabelVal 스타일)
 * @param {{ hole: any, onPatch:(id:number, patch:Object)=>void }} props
 */
export default function HoleCard({ hole, onPatch }) {
  const isPar3 = hole.par === 3;
  const patch = (p) => onPatch(hole.id, p);

  function onParChange(e) {
    const p = Number(e.target.value);
    // 규칙: par=3 → FIR null 강제
    patch({ par: p, ...(p === 3 ? { fir: null } : {}) });
  }

  const strokes =
    hole?.par != null && hole?.score != null ? hole.par + hole.score : null;

  return (
    <div className="hole hole--edit">
      {/* 헤더 */}
      <div className="hole__head">
        <div className="hole__title">Hole {hole.hole_number}</div>
        <select className="hole__select" value={hole.par} onChange={onParChange}>
          {[3, 4, 5, 6].map((p) => (
            <option key={p} value={p}>
              Par {p}
            </option>
          ))}
        </select>
      </div>

      {/* LabelVal 스타일 그리드 */}
      <div className="holelv__grid">
        {/* Score(±) — 스텝퍼 (첫 클릭 0부터) */}
        <LabelField label="Score(±)">
          <NumberStepper
            value={hole.score}
            onChange={(v) => patch({ score: v })}
            min={RANGES.score.min}
            max={RANGES.score.max}
            initial={RANGES.score.initial}   // ⬅️ 0부터
            behavior="snap"
          />
        </LabelField>

        {/* Strokes — 계산값 표시 */}
        <LabelField label="Strokes" readonly>
          <div className="holelv__value">{strokes == null ? '-' : strokes}</div>
        </LabelField>

        {/* Putts — 스텝퍼 (첫 클릭 2부터) */}
        <LabelField label="Putts">
          <NumberStepper
            value={hole.putts}
            onChange={(v) => patch({ putts: v })}
            min={RANGES.putts.min}
            max={RANGES.putts.max}
            initial={RANGES.putts.initial}    // ⬅️ 2부터
            behavior="snap"
          />
        </LabelField>

        {/* Penalties — 스텝퍼 (첫 클릭 0부터) */}
        <LabelField label="Penalties">
          <NumberStepper
            value={hole.penalties}
            onChange={(v) => patch({ penalties: v })}
            min={RANGES.penalties.min}
            max={RANGES.penalties.max}
            initial={RANGES.penalties.initial} // ⬅️ 0부터
            behavior="snap"
          />
        </LabelField>

        {/* FIR — Y · – · N (par3면 비활성+null) */}
        <LabelField label="FIR">
          <TriStateToggle
            value={isPar3 ? null : hole.fir}
            onChange={(v) => patch({ fir: v })}
            disabled={isPar3}
            order={[1, null, 0]} // Y · – · N
            labels={{ '1': 'Y', '0': 'N', null: '–' }}
          />
        </LabelField>

        {/* GIR — Y · – · N */}
        <LabelField label="GIR">
          <TriStateToggle
            value={hole.gir}
            onChange={(v) => patch({ gir: v })}
            order={[1, null, 0]} // Y · – · N
            labels={{ '1': 'Y', '0': 'N', null: '–' }}
          />
        </LabelField>
      </div>

      {/* 메모 */}
      <textarea
        className="hole__memo"
        rows={2}
        placeholder="메모"
        value={hole.notes || ''}
        onChange={(e) => patch({ notes: e.target.value || null })}
      />
    </div>
  );
}

/** Label + (값 or 컨트롤) 공용 컨테이너 (HoleView의 LabelVal 룩) */
function LabelField({ label, children, readonly = false }) {
  return (
    <div className={`holelv ${readonly ? 'holelv--readonly' : ''}`}>
      <div className="holelv__label">{label}</div>
      <div className="holelv__ctrl">{children}</div>
    </div>
  );
}
