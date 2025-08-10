// src/components/HoleEditRow.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './HoleEditRow.css';

export default function HoleEditRow({ hole, onChange }) {
  const [score, setScore]         = useState(hole.score ?? 0);   // ± 스코어
  const [putts, setPutts]         = useState(hole.putts ?? 0);
  const [fwHit, setFwHit]         = useState(!!hole.fw_hit);
  const [gir, setGir]             = useState(!!hole.gir);
  const [penalties, setPenalties] = useState(hole.penalties ?? 0);
  const [notes, setNotes]         = useState(hole.notes ?? '');

  // 값 바뀔 때 부모로 패치 전달
  useEffect(() => {
    onChange?.(hole.id, {
      score:       typeof score === 'number' ? score : Number(score),
      putts:       typeof putts === 'number' ? putts : Number(putts),
      fw_hit:      !!fwHit,
      gir:         !!gir,
      penalties:   typeof penalties === 'number' ? penalties : Number(penalties),
      notes:       notes ?? null,
    });
  }, [hole.id, score, putts, fwHit, gir, penalties, notes, onChange]);

  return (
    <div className="her-row">
      <div className="her-head">
        <div className="her-hole">{hole.hole_number}H</div>
        <div className="her-par">Par {hole.par}</div>
      </div>

      <div className="her-grid">
        <label className="her-field">
          <span>Score(±)</span>
          <input
            type="number"
            value={score}
            onChange={e => setScore(Number(e.target.value))}
            className="her-input num"
          />
        </label>

        <label className="her-field">
          <span>Putts</span>
          <input
            type="number"
            min={0}
            value={putts}
            onChange={e => setPutts(Number(e.target.value))}
            className="her-input num"
          />
        </label>

        <label className="her-field chk">
          <input
            type="checkbox"
            checked={fwHit}
            onChange={e => setFwHit(e.target.checked)}
          />
          <span>FIR</span>
        </label>

        <label className="her-field chk">
          <input
            type="checkbox"
            checked={gir}
            onChange={e => setGir(e.target.checked)}
          />
          <span>GIR</span>
        </label>

        <label className="her-field">
          <span>Penalties</span>
          <input
            type="number"
            min={0}
            value={penalties}
            onChange={e => setPenalties(Number(e.target.value))}
            className="her-input num"
          />
        </label>

        <label className="her-field span2">
          <span>Notes</span>
          <input
            type="text"
            value={notes ?? ''}
            onChange={e => setNotes(e.target.value)}
            className="her-input"
            placeholder="메모"
          />
        </label>
      </div>
    </div>
  );
}

HoleEditRow.propTypes = {
  hole: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    hole_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    par: PropTypes.number,
    score: PropTypes.number,
    fw_hit: PropTypes.bool,
    gir: PropTypes.bool,
    putts: PropTypes.number,
    penalties: PropTypes.number,
    notes: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func, // (holeId, patch) => void
};
