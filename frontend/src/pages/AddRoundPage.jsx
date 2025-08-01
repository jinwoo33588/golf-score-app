// src/pages/AddRoundPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoleStepForm from '../components/round/HoleStepForm';
import FullRoundForm from '../components/round/FullRoundForm';
import axios from '../utils/axiosInstance';

const courseData = {
  '아시아나CC': [4, 5, 4, 3, 4, 3, 5, 3, 4, 4, 4, 5, 3, 4, 4, 5, 3, 4],
  '레이크우드CC': [4, 4, 5, 3, 4, 3, 4, 5, 4, 4, 5, 3, 4, 4, 4, 5, 3, 4],
};

const generateInitialData = (courseName) => {
  const parArray = courseData[courseName] || Array(18).fill(4);
  return parArray.map((par, i) => ({
    hole: i + 1,
    par,
    score: '',
    teeshot: '',
    approach: '',
    putts: '',
    gir: false,
  }));
};

const AddRoundPage = () => {
  const [viewMode, setViewMode] = useState('full');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [roundData, setRoundData] = useState([]);
  const navigate = useNavigate();

  const handleCourseChange = (e) => {
    const selected = e.target.value;
    setCourse(selected);
    setRoundData(generateInitialData(selected));
  };

  const handleSave = async () => {
    console.log('▶ handleSave called', { date, course, roundData });
    if (!date || !course || roundData.length === 0) {
      alert('날짜와 코스를 선택하고 정보를 입력해주세요.');
      return;
    }

    try {
      // 1) 라운드 생성
      const {
        data: { round },
      } = await axios.post('/rounds', {
        courseName: course,
        date,
        weather: '-',
      });
      const roundId = round.id;

      // 2) 홀 생성
      await axios.post(`/rounds/${roundId}/holes`, {
        holes: roundData.map((h) => ({ hole_number: h.hole, par: Number(h.par) })),
      });

      // 3) 생성된 홀 ID 조회
      const { data: holes } = await axios.get(`/rounds/${roundId}/holes`);

      // 4) 샷 생성
      const shotPromises = holes.map((hole, idx) => {
        const hData = roundData[idx];
        const shots = [];
        if (hData.teeshot) {
          shots.push({ shot_number: 1, club: hData.teeshot });
        }
        if (hData.approach) {
          shots.push({ shot_number: shots.length + 1, club: hData.approach });
        }
        if (hData.putts !== '') {
          shots.push({
            shot_number: shots.length + 1,
            club: 'Putter',
            result: `${hData.putts} putts`,
          });
        }
        return shots.length
          ? axios.post(`/holes/${hole.id}/shots`, { shots })
          : Promise.resolve();
      });
      await Promise.all(shotPromises);

      alert('✅ 라운드, 홀, 샷 저장 완료!');
      navigate('/');
    } catch (err) {
      console.error('❌ 저장 실패:', err.response?.data || err.message);
      alert('저장 실패');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">⛳ 새 라운드 기록</h1>
      </div>

      {/* 날짜 + 코스 선택 */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />
        <select
          value={course}
          onChange={handleCourseChange}
          className="border px-4 py-2 rounded"
        >
          <option value="">코스를 선택하세요</option>
          {Object.keys(courseData).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* 보기 전환 버튼 */}
      {course && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setViewMode('full')}
            className={`px-4 py-2 rounded ${
              viewMode === 'full' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            18홀 전체 보기
          </button>
          <button
            onClick={() => setViewMode('step')}
            className={`px-4 py-2 rounded ${
              viewMode === 'step' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            홀별 보기
          </button>
        </div>
      )}

      {/* 입력 폼 */}
      {course &&
        (viewMode === 'full' ? (
          <FullRoundForm roundData={roundData} setRoundData={setRoundData} />
        ) : (
          <HoleStepForm roundData={roundData} setRoundData={setRoundData} />
        ))}

      {/* 저장 버튼 */}
      {course && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
};

export default AddRoundPage;
