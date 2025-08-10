// src/components/round/FullRoundForm.jsx
import React from 'react';
import './FullRoundForm.css';

const FullRoundForm = ({ roundData, setRoundData }) => {
  // 일반 필드 변경
  const handleChange = (index, field, value) => {
    const updated = [...roundData];
    updated[index][field] = value;
    setRoundData(updated);
  };

  // ─── Score controls per hole ───────────────────────────────────
  const decrementScore = (index) => {
    const s = roundData[index].score;
    // 현재값이 있으면 그 값, 없으면 null
    const current = s !== '' && s != null ? s : null;
    // 값이 있으면 current-1, 없으면 0, 최소값 -2
    const newVal = current != null
      ? Math.max(-2, current - 1)
      : 0;
    handleChange(index, 'score', newVal);
  };
  const incrementScore = (index) => {
    const s = roundData[index].score;
    const current = s !== '' && s != null ? s : null;
    const maxPar  = roundData[index].par;
    // 값이 있으면 current+1, 없으면 0, 최대값 par
    const newVal = current != null
      ? Math.min(current + 1, maxPar)
      : 0;
    handleChange(index, 'score', newVal);
  };

  // ─── Putts controls per hole ────────────────────────────────────
  const decrementPutts = (index) => {
    const p = roundData[index].putts;
    // 빈 값이면 기본 2
    const current = p !== '' && p != null ? p : null;
    // current-1, 최소값 1
    const newVal = current != null
      ?  Math.max(1, current - 1)
      : 2;
    handleChange(index, 'putts', newVal);
  };
  const incrementPutts = (index) => {
    const p = roundData[index].putts;
    const current = p !== '' && p != null ? p : null;
    // 언제나 +1
    const newVal = current != null
      ? current + 1
      : 2; // 빈 값은 2로 처리
    handleChange(index, 'putts', newVal);
  };

  // ─── Shot 배열 변경 함수들 ────────────────────────────────────────
  const handleShotChange = (holeIdx, shotIdx, key, value) => {
    const updated = [...roundData];
    updated[holeIdx].shots[shotIdx][key] = value;
    setRoundData(updated);
  };
  const addShot = (holeIdx) => {
    const updated = [...roundData];
    updated[holeIdx].shots.push({
      club:           '',
      condition:      '',
      remaining_dist: '',
      actual_dist:    '',
      result:         '',
      notes:          ''
    });
    setRoundData(updated);
  };
  const removeShot = (holeIdx, shotIdx) => {
    const updated = [...roundData];
    updated[holeIdx].shots.splice(shotIdx, 1);
    setRoundData(updated);
  };

  return (
    <div className="full-round-form">
      <h1>🏁 라운드 종료 후 입력 (18홀 전체)</h1>
      {roundData.map((hole, idx) => (
        <div key={hole.hole} className="hole-row">
          <div className="hole-header">
            {/* 홀 번호 / Par */}
            <div className="hole-number">
              {hole.hole}홀 <span className="hole-par">(Par {hole.par})</span>
            </div>

            {/* Score control */}
            <div className="score-control">
              <button
                onClick={() => decrementScore(idx)}
                disabled={
                  roundData[idx].score != null
                    ? roundData[idx].score <= -2
                    : false
                }
              >−</button>
              <span>
                {roundData[idx].score != null
                  ? roundData[idx].score
                  : 0}
              </span>
              <button
                onClick={() => incrementScore(idx)}
                disabled={
                  roundData[idx].score != null
                    ? roundData[idx].score >= hole.par
                    : false
                }
              >＋</button>
            </div>

            {/* Putts control */}
            <div className="putts-control">
              <button
                onClick={() => decrementPutts(idx)}
                disabled={
                  // 빈 값은 2로 보고, 1 이하면 비활성화
                  (roundData[idx].putts !== '' && roundData[idx].putts != null
                    ? roundData[idx].putts
                    : 2) <= 1
                }
              >−</button>
              <span>
                {roundData[idx].putts != null
                  ? roundData[idx].putts
                  : 2}
              </span>
              <button onClick={() => incrementPutts(idx)}>＋</button>
            </div>

            {/* FIR / GIR / Penalties */}
            <label>
              FIR
              <input
                type="checkbox"
                checked={hole.fw_hit}
                onChange={e => handleChange(idx, 'fw_hit', e.target.checked)}
              />
            </label>
            <label>
              GIR
              <input
                type="checkbox"
                checked={hole.gir}
                onChange={e => handleChange(idx, 'gir', e.target.checked)}
              />
            </label>
            <input
              type="number"
              value={hole.penalties}
              onChange={e => handleChange(idx, 'penalties', e.target.value)}
              placeholder="벌타"
              min="0"
            />

            {/* + 샷 추가 버튼 */}
            <button
              onClick={() => addShot(idx)}
              className="add-shot-btn"
            >
              + 샷 추가
            </button>
          </div>

          {/* Shots list */}
          <div className="shots-list">
            {hole.shots.map((s, j) => (
              <div key={j} className="shot-item">
                <select
                  value={s.club}
                  onChange={e => handleShotChange(idx, j, 'club', e.target.value)}
                >
                  <option value="">클럽</option>
                  <option>드라이버</option>
                  <option>3번 우드</option>
                  <option>5번 우드</option>
                  <option>4번 유틸리티</option>
                  <option>5번 아이언</option>
                  <option>6번 아이언</option>
                  <option>7번 아이언</option>
                  <option>8번 아이언</option>
                  <option>9번 아이언</option>
                  <option>PW</option>
                  <option>50도</option>
                  <option>52도</option>
                  <option>56도</option>
                  <option>퍼터</option>
                </select>

                <select
                  value={s.condition}
                  onChange={e => handleShotChange(idx, j, 'condition', e.target.value)}
                >
                  <option value="tee">Tee</option>
                  <option value="fairway">Fairway</option>
                  <option value="rough">Rough</option>
                  <option value="bunker">Bunker</option>
                  <option value="penalty">Penalty</option>
                </select>

                <input
                  type="number"
                  placeholder="남은 거리"
                  value={s.remaining_dist}
                  onChange={e => handleShotChange(idx, j, 'remaining_dist', e.target.value)}
                />

                <input
                  type="number"
                  placeholder="실제 거리"
                  value={s.actual_dist}
                  onChange={e => handleShotChange(idx, j, 'actual_dist', e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Result"
                  value={s.result}
                  onChange={e => handleShotChange(idx, j, 'result', e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Notes"
                  value={s.notes}
                  onChange={e => handleShotChange(idx, j, 'notes', e.target.value)}
                />

                <button
                  onClick={() => removeShot(idx, j)}
                  className="remove-shot"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FullRoundForm;
