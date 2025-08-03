// src/components/round/FullRoundForm.jsx
import React from 'react';

const FullRoundForm = ({ roundData, setRoundData }) => {
  const handleChange = (index, field, value) => {
    const updated = [...roundData];
    updated[index][field] = value;
    setRoundData(updated);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-4">🏁 라운드 종료 후 입력 (18홀 전체)</h1>
      {roundData.map((hole, idx) => (
        <div key={hole.hole} className="flex items-center gap-4 border-b pb-2">
          <div className="w-24 font-semibold">
            {hole.hole}홀 <span className="text-sm text-gray-500">(Par {hole.par})</span>
          </div>

          {/* 스코어 */}
          <input
            type="number"
            value={hole.score || ''}
            onChange={e => handleChange(idx, 'score', e.target.value)}
            placeholder="스코어"
            className="border px-2 py-1 w-20 rounded"
          />

          {/* 퍼팅 수 */}
          <input
            type="number"
            value={hole.putts || ''}
            onChange={e => handleChange(idx, 'putts', e.target.value)}
            placeholder="퍼팅 수"
            className="border px-2 py-1 w-20 rounded"
          />

          {/* GIR */}
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={hole.gir}
              onChange={e => handleChange(idx, 'gir', e.target.checked)}
              className="form-checkbox"
            />
            GIR
          </label>

          {/* 페어웨이 안착 */}
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={hole.fw_hit}
              onChange={e => handleChange(idx, 'fw_hit', e.target.checked)}
              className="form-checkbox"
            />
            FIR
          </label>

          {/* 벌타 */}
          <input
            type="number"
            value={hole.penalties}
            onChange={e => handleChange(idx, 'penalties', e.target.value)}
            placeholder="벌타"
            className="border px-2 py-1 w-20 rounded"
            min="0"
          />
        </div>
      ))}
    </div>
  );
};

export default FullRoundForm;
