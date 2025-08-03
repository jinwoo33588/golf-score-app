// src/components/round/HoleStepForm.jsx
import React, { useState } from 'react';

const HoleStepForm = ({ roundData, setRoundData }) => {
  const [current, setCurrent] = useState(0);
  const hole = roundData[current];

  const handleChange = (field, value) => {
    const updated = [...roundData];
    updated[current][field] = value;
    setRoundData(updated);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        ⛳ {hole.hole}홀 입력 <span className="text-base text-gray-500">(Par {hole.par})</span>
      </h1>

      <div className="flex flex-col gap-4">
        {/* 스코어 */}
        <input
          type="number"
          value={hole.score || ''}
          onChange={e => handleChange('score', e.target.value)}
          placeholder="스코어"
          className="border px-2 py-1 rounded"
        />

        {/* 퍼팅 수 */}
        <input
          type="number"
          value={hole.putts || ''}
          onChange={e => handleChange('putts', e.target.value)}
          placeholder="퍼팅 수"
          className="border px-2 py-1 rounded"
        />

        {/* GIR */}
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={hole.gir}
            onChange={e => handleChange('gir', e.target.checked)}
            className="form-checkbox"
          />
          GIR
        </label>

        {/* 페어웨이 안착 */}
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={hole.fw_hit}
            onChange={e => handleChange('fw_hit', e.target.checked)}
            className="form-checkbox"
          />
          FIR
        </label>

        {/* 벌타 */}
        <input
          type="number"
          value={hole.penalties}
          onChange={e => handleChange('penalties', e.target.value)}
          placeholder="벌타"
          className="border px-2 py-1 rounded"
          min="0"
        />
      </div>

      {/* 네비게이션 */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrent(prev => Math.max(prev - 1, 0))}
          disabled={current === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          이전 홀
        </button>
        <button
          onClick={() => setCurrent(prev => Math.min(prev + 1, roundData.length - 1))}
          disabled={current === roundData.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          다음 홀
        </button>
      </div>
    </div>
  );
};

export default HoleStepForm;
