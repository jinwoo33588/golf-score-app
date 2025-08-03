import React, { useEffect, useState } from 'react';
import RoundCard from '../components/RoundCard';
import StatBox from '../components/StatBox';
import Topbar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get('/rounds');
        const mapped = res.data.map(r => ({
          id:     r.id,
          course: r.course_name,            // DB 컬럼명에 맞춤
          date:   r.date,
          // score:  r.total_score != null     // total_score이 null이 아닐 때만 값 표시
          //           ? r.total_score
          //           : '-'
          weather: r.weather
        }));
        setRounds(mapped);
      } catch (err) {
        console.error('❌ 라운드 불러오기 실패:', err);
      }
    };
    fetchRounds();
  }, []);

  return (
    <div className="home-container">
      <Topbar />
      <h1 className="home-title">⛳ 내 골프 라운드 기록</h1>

      <div className="stat-boxes">
        <StatBox label="평균 스코어" value="89.3" />
        <StatBox label="FIR" value="42%" />
        <StatBox label="GIR" value="38%" />
      </div>

      <div className="round-header">
        <h2 className="round-title">최근 라운드</h2>
        <button
          onClick={() => navigate('/round/new')}
          className="add-round-btn"
        >
          + 새 라운드
        </button>
      </div>

      <div className="round-list">
        {rounds.map(round => (
          <RoundCard key={round.id} round={round} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
