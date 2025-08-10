import React, { useState } from 'react';
import './HoleStepForm.css';

/**
 * HoleStepForm
 * Props:
 *  - roundData: Array of hole objects [{ hole, par, score, putts, gir, fw_hit, penalties, shots: [...] }]
 *  - setRoundData: function to update roundData
 */
const HoleStepForm = ({ roundData, setRoundData }) => {
  const [current, setCurrent] = useState(0);
  const hole = roundData[current];

  // Update hole-level fields
  const handleHoleChange = (field, value) => {
    const updated = [...roundData];
    updated[current] = { ...updated[current], [field]: value };
    setRoundData(updated);
  };

  // Update shot-level fields
  const handleShotChange = (shotIdx, field, value) => {
    const updated = [...roundData];
    const shots = [...(updated[current].shots || [])];
    shots[shotIdx] = { ...shots[shotIdx], [field]: value };
    updated[current] = { ...updated[current], shots };
    setRoundData(updated);
  };

  // Add a new shot
  const addShot = () => {
    const updated = [...roundData];
    const shots = [...(updated[current].shots || [])];
    shots.push({ club: '', condition: 'tee', remaining_dist: '', actual_dist: '', result: '', notes: '' });
    updated[current] = { ...updated[current], shots };
    setRoundData(updated);
  };

  // Remove a shot
  const removeShot = (idx) => {
    const updated = [...roundData];
    const shots = updated[current].shots.filter((_, i) => i !== idx);
    updated[current] = { ...updated[current], shots };
    setRoundData(updated);
  };

  return (
    <div className="hole-step-form">
      <h1>
        ⛳ {hole.hole}홀 입력 <span className="hole-par">(Par {hole.par})</span>
      </h1>

      {/* Hole-level fields */}
      <div className="fields hole-fields">
        <input
          type="number"
          value={hole.score || ''}
          onChange={e => handleHoleChange('score', e.target.value)}
          placeholder="스코어"
        />
        <input
          type="number"
          value={hole.putts || ''}
          onChange={e => handleHoleChange('putts', e.target.value)}
          placeholder="퍼팅"
        />
        <label>
          <input
            type="checkbox"
            checked={Boolean(hole.gir)}
            onChange={e => handleHoleChange('gir', e.target.checked)}
          /> GIR
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(hole.fw_hit)}
            onChange={e => handleHoleChange('fw_hit', e.target.checked)}
          /> FIR
        </label>
        <input
          type="number"
          value={hole.penalties || ''}
          onChange={e => handleHoleChange('penalties', e.target.value)}
          placeholder="벌타"
          min="0"
        />
      </div>

      {/* Shot-level fields: inline like FullRoundForm */}
      {hole.shots?.map((s, idx) => (
        <div key={idx} className="shot-row">
          <span className="shot-index">{idx + 1}</span>
          <input
            type="text"
            value={s.club}
            onChange={e => handleShotChange(idx, 'club', e.target.value)}
            placeholder="클럽"
          />
          <select
            value={s.condition}
            onChange={e => handleShotChange(idx, 'condition', e.target.value)}
          >
            <option value="tee">Tee</option>
            <option value="fairway">Fairway</option>
            <option value="rough">Rough</option>
            <option value="bunker">Bunker</option>
            <option value="penalty">Penalty</option>
          </select>
          <input
            type="number"
            value={s.remaining_dist || ''}
            onChange={e => handleShotChange(idx, 'remaining_dist', e.target.value)}
            placeholder="남은거리"
          />
          <input
            type="number"
            value={s.actual_dist || ''}
            onChange={e => handleShotChange(idx, 'actual_dist', e.target.value)}
            placeholder="실제거리"
          />
          <input
            type="text"
            value={s.result}
            onChange={e => handleShotChange(idx, 'result', e.target.value)}
            placeholder="결과"
          />
          <input
            type="text"
            value={s.notes}
            onChange={e => handleShotChange(idx, 'notes', e.target.value)}
            placeholder="메모"
          />
          <button
            type="button"
            className="remove-shot-btn"
            onClick={() => removeShot(idx)}
          >삭제</button>
        </div>
      ))}
      <button type="button" className="add-shot-btn" onClick={addShot}>
        + 샷 추가
      </button>

      {/* Navigation */}
      <div className="navigation">
        <button
          onClick={() => setCurrent(prev => Math.max(prev - 1, 0))}
          disabled={current === 0}
        >이전 홀</button>
        <button
          onClick={() => setCurrent(prev => Math.min(prev + 1, roundData.length - 1))}
          disabled={current === roundData.length - 1}
        >다음 홀</button>
      </div>
    </div>
  );
};

export default HoleStepForm;
