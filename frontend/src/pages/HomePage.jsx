// import React, { useEffect, useState } from 'react';
import React from 'react'
import RoundCard from '../components/RoundCard';
import StatBox from '../components/StatBox';
import { useNavigate } from 'react-router-dom';
import useRounds from '../hooks/useRounds';
// import axios from '../service/axiosInstance';
import './HomePage.css';

const HomePage = () => {
  // const navigate = useNavigate();
  // const [rounds, setRounds] = useState([]);

  const navigate = useNavigate();
  const { rounds} = useRounds();

  // useEffect(() => {
  //   const fetchRounds = async () => {
  //     try {
  //       const res = await axios.get('/rounds');
  //       const mapped = res.data.map(r => ({
  //         id:     r.id,
  //         course: r.course_name,            // DB 컬럼명에 맞춤
  //         date:   r.date,
  //         // score:  r.total_score != null     // total_score이 null이 아닐 때만 값 표시
  //         //           ? r.total_score
  //         //           : '-'
  //         weather: r.weather
  //       }));
  //       setRounds(mapped);
  //     } catch (err) {
  //       console.error('❌ 라운드 불러오기 실패:', err);
  //     }
  //   };
  //   fetchRounds();
  // }, []);
   // 최근 3개만 잘라내서, RoundCard가 기대하는 필드로 매핑
   const recent = rounds.slice(0,5);


  return (
    <div className="container">
      <h1 className="home-title">⛳ 내 골프 라운드 기록</h1>

      <div className="stat-boxes">
        <StatBox label="평균 스코어" value="89.3" />
        <StatBox label="FIR" value="42%" />
        <StatBox label="GIR" value="38%" />
      </div>

      <div className="round-header">
        <h2 className="round-title">최근 라운드</h2>
        <button
          onClick={() => navigate('/rounds/new')}
          className="add-round-btn"
        >
          + 새 라운드
        </button>
      </div>

      <div className="round-list">
      {recent.map(round => (
         <RoundCard  key={round.id} round={round} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
