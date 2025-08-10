// src/components/unified/HoleCardUnified.jsx
import React from 'react';
import NumberStepper from './NumberStepper';
import { YesNoToggle, YesNoBadge } from './YesNoToggle';
import ShotList from './ShotList';

export default function HoleCardUnified({
  hole,
  onChange,           // (updatedHole) => void
  mode = 'view',      // 'view' | 'edit'  (add도 edit로 동일 처리)
  showShots = true,
}) {
  const editable = mode !== 'view';
  const h = hole || {};
  const n = (x, def = 0) => (typeof x === 'number' ? x : Number(x) || def);

  const patch = (key, val) => onChange && onChange({ ...h, [key]: val });

  // 샷 핸들러
  const addShot = (s) => patch('shots', [...(h.shots || []), s]);
  const changeShot = (idx, newShot) => {
    const next = [...(h.shots || [])];
    next[idx] = newShot;
    patch('shots', next);
  };
  const removeShot = (idx) => {
    const next = [...(h.shots || [])];
    next.splice(idx, 1);
    patch('shots', next);
  };

  return (
    <div className={`gt-holecard ${editable ? 'is-edit' : 'is-view'}`}>
      <div className="gt-holehead">
        <div className="gt-holehead__left">
          <div className="gt-hole-num">{h.hole_number}H</div>
          <div className="gt-hole-meta">Par {h.par}</div>
        </div>

        {!editable && (
          <div className="gt-hole-badges">
            <div className="gt-badge">FIR <YesNoBadge value={!!h.fir} /></div>
            <div className="gt-badge">GIR <YesNoBadge value={!!h.gir} /></div>
          </div>
        )}
      </div>

      <div className="gt-holegrid">
        <NumberStepper
          label="스코어(±)"
          value={n(h.score, 0)}
          onChange={(v) => patch('score', v)}
          allowTyping={false}
          disabled={!editable}
          min={-10}
          max={10}
        />
        <NumberStepper
          label="퍼팅수"
          value={n(h.putts, 0)}
          onChange={(v) => patch('putts', v)}
          allowTyping={false}
          disabled={!editable}
          min={0}
          max={10}
        />
        <NumberStepper
          label="페널티"
          value={n(h.penalties, 0)}
          onChange={(v) => patch('penalties', v)}
          allowTyping={false}
          disabled={!editable}
          min={0}
          max={10}
        />

        {editable ? (
          <>
            <YesNoToggle
              label="FIR"
              value={!!h.fir}
              onChange={(v) => patch('fir', v)}
            />
            <YesNoToggle
              label="GIR"
              value={!!h.gir}
              onChange={(v) => patch('gir', v)}
            />
          </>
        ) : (
          <>
            <div className="gt-spacer" />
            <div className="gt-spacer" />
          </>
        )}
      </div>

      <div className="gt-holenotes">
        <div className="gt-notes__label">노트</div>
        {editable ? (
          <textarea
            value={h.notes || ''}
            onChange={(e) => patch('notes', e.target.value)}
            placeholder="메모를 입력하세요"
          />
        ) : (
          <div className={`gt-notes__view ${h.notes ? '' : 'is-empty'}`}>
            {h.notes || '메모 없음'}
          </div>
        )}
      </div>

      {showShots && (
        <div className="gt-holeshots">
          <div className="gt-section__title">샷</div>
          <ShotList
            shots={h.shots || []}
            editable={editable}
            onAdd={addShot}
            onChange={changeShot}
            onRemove={removeShot}
          />
        </div>
      )}
    </div>
  );
}
