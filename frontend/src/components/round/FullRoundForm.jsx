// ✅ src/components/round/FullRoundForm.jsx
const FullRoundForm = ({ roundData, setRoundData }) => {
  const handleChange = (index, field, value) => {
    const updated = [...roundData];
    updated[index][field] = value;
    setRoundData(updated);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold mb-4">🏁 라운드 종료 후 입력 (18홀 전체)</h1>
      {roundData.map((hole, index) => (
        <div key={hole.hole} className="flex items-center gap-4 border-b pb-2">
          <div className="w-24 font-semibold">
            {hole.hole}홀 <span className="text-sm text-gray-500">(파{hole.par})</span>
          </div>
          <input
            type="number"
            value={hole.score}
            onChange={(e) => handleChange(index, 'score', e.target.value)}
            placeholder="스코어"
            className="border px-2 py-1 w-20 rounded"
          />

          <select
            value={hole.teeshot}
            onChange={(e) => handleChange(index, 'teeshot', e.target.value)}
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
            onChange={(e) => handleChange(index, 'approach', e.target.value)}
            placeholder="어프로치"
            className="border px-2 py-1 w-32 rounded"
          />

          <input
            type="number"
            value={hole.putts}
            onChange={(e) => handleChange(index, 'putts', e.target.value)}
            placeholder="퍼팅 수"
            className="border px-2 py-1 w-20 rounded"
          />
        </div>
      ))}
    </div>
  );
};

export default FullRoundForm;