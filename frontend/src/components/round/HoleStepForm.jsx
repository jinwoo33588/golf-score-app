// ✅ src/components/round/HoleStepForm.jsx
import { useState } from 'react';

const HoleStepForm = ({ roundData, setRoundData }) => {
  const [current, setCurrent] = useState(0); // 0 ~ 17
  const hole = roundData[current];

  const handleChange = (field, value) => {
    const updated = [...roundData];
    updated[current][field] = value;
    setRoundData(updated);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        ⛳ {hole.hole}홀 입력 <span className="text-base text-gray-500">(파{hole.par})</span>
      </h1>

      <div className="flex flex-col gap-4">
        <input
          type="number"
          value={hole.score}
          onChange={(e) => handleChange('score', e.target.value)}
          placeholder="스코어"
          className="border px-2 py-1 rounded"
        />

        <select
          value={hole.teeshot}
          onChange={(e) => handleChange('teeshot', e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">티샷</option>
          <option value="페어웨이">페어웨이</option>
          <option value="러프">러프</option>
          <option value="OB/패널티">OB/패널티</option>
        </select>

        <input
          type="text"
          value={hole.approach}
          onChange={(e) => handleChange('approach', e.target.value)}
          placeholder="어프로치"
          className="border px-2 py-1 rounded"
        />

        <input
          type="number"
          value={hole.putts}
          onChange={(e) => handleChange('putts', e.target.value)}
          placeholder="퍼팅 수"
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
          disabled={current === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          이전 홀
        </button>
        <button
          onClick={() => setCurrent((prev) => Math.min(prev + 1, 17))}
          disabled={current === 17}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          다음 홀
        </button>
      </div>
    </div>
  );
};

export default HoleStepForm;
