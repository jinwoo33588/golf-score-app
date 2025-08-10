// src/pages/AddRoundPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRoundPage.css';

import DateSelector    from '../components/DateSelector';
import CourseSelector  from '../components/CourseSelector';
import ScoreCard       from '../components/ScoreCard';
import FullRoundForm   from '../components/round/FullRoundForm';
import HoleStepForm    from '../components/round/HoleStepForm';

import { createRound }       from '../services/roundService';
import { createHoles, getHolesByRound } from '../services/holeService';
import { createShot }        from '../services/shotService';

const courseData = {
  '아시아나CC': [4,5,4,3,4,3,5,3,4,4,4,5,3,4,4,5,3,4],
  '레이크우드CC': [4,4,5,3,4,3,4,5,4,4,5,3,4,4,4,5,3,4],
  '양평 TPC CC': [4,5,3,4,4,4,3,4,5,4,4,4,3,5,4,3,5,4]
};

const generateInitialData = (courseName) => {
  const parArray = courseData[courseName] || Array(18).fill(4);
  return parArray.map((par, i) => ({
    hole:      i + 1,
    par,
    score:     '',
    putts:     '',
    gir:       false,
    fw_hit:    false,
    penalties: 0,
    shots:     [],
  }));
};

export default function AddRoundPage() {
  const navigate = useNavigate();

  const [date,      setDate]      = useState('');
  const [course,    setCourse]    = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [viewMode,  setViewMode]  = useState('full');
  const [roundData, setRoundData] = useState([]);

  useEffect(() => {
    if (course) {
      setRoundData(generateInitialData(course));
    }
  }, [course]);

   // 코스가 바뀌면 Form 숨기기
   useEffect(() => {
    if (course) {
      setRoundData(generateInitialData(course));
    }
    setIsConfirmed(false);
  }, [course]);

  // 날짜가 바뀌어도 Form 숨기기
  useEffect(() => {
    setIsConfirmed(false);
  }, [date]);

  const handleConfirm = () => {
    if (!date || !course) {
      alert('날짜와 코스를 먼저 선택해주세요.');
      return;
    }
    setIsConfirmed(true);
  };


  const handleSave = async () => {
    if (!date || !course) {
      alert('날짜와 코스를 선택해주세요.');
      return;
    }
    try {
      // 1) 라운드 생성
      const round = await createRound({ courseName: course, date, weather: '-' });
      const roundId = round.id;

      // 2) 홀 일괄 생성
      await createHoles(
        roundId,
        roundData.map(h => ({
          hole_number: Number(h.hole),
          par:         Number(h.par),
          score:       h.score!=='' ? Number(h.score) : null,
          putts:       h.putts!=='' ? Number(h.putts) : null,
          gir:         Boolean(h.gir),
          fw_hit:      Boolean(h.fw_hit),
          penalties:   Number(h.penalties),
        }))
      );

      // 3) 생성된 홀 조회
      const holes = await getHolesByRound(roundId);

      // 4) 샷 생성
      const shotPromises = [];
      holes.forEach((hole, idx) => {
        let shotNumber = 1;
        roundData[idx].shots.forEach(s => {
          shotPromises.push(
            createShot(hole.id, {
              shot_number:    shotNumber++,
              club:           s.club           || '-',
              condition:     s.condition,
              remaining_dist:s.remaining_dist,
              actual_dist:   s.actual_dist,
              result:        s.result,
              notes:         s.notes
            })
          );
        });
      });
      await Promise.all(shotPromises);

      alert('✅ 라운드, 홀, 샷 저장 완료!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">⛳ 새 라운드 기록</h1>

      {/* 날짜 + 코스 + 확인 버튼 */}
      <div className="selector-wrapper">
        <DateSelector onDateChange={setDate} />
        <CourseSelector
          courseData={courseData}
          selectedCourse={course}
          onCourseChange={setCourse}
        />
        <button
          className="confirm-button"
          onClick={handleConfirm}
          disabled={!date || !course}
        >
          확인
        </button>
       
      </div>
      {/* 스코어카드: 날짜/코스 영역 바로 아래에 배치 */}
      {isConfirmed && (
        <div className="scorecard-wrapper left">
          <ScoreCard />
        </div>
      )}

      {/* 확인 전까지는 폼 숨기기 */}
      { !isConfirmed && (
        <p className="info-text">날짜와 코스를 선택 후 “확인” 버튼을 눌러주세요.</p>
      )}

      {/* 확인 이후에만 아래 내용 렌더 */}
      { isConfirmed && (
        <>
          {/* 보기 전환 버튼 */}
          <div className="viewmode-buttons">
            <button
              onClick={() => setViewMode('full')}
              className={viewMode === 'full' ? 'active' : ''}
            >18홀 전체 보기</button>
            <button
              onClick={() => setViewMode('step')}
              className={viewMode === 'step' ? 'active' : ''}
            >홀별 보기</button>
          </div>

          {/* 입력 폼 */}
          {viewMode === 'full'
            ? <FullRoundForm roundData={roundData} setRoundData={setRoundData}/>
            : <HoleStepForm  roundData={roundData} setRoundData={setRoundData}/>
          }

          {/* 저장 버튼 */}
          <div className="save-button-wrapper">
            <button onClick={handleSave}>저장</button>
          </div>
        </>
      )}
    </div>
  );
}


