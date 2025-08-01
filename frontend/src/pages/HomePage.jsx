// src/pages/HomePage.jsx
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
        const res = await axios.get('/rounds');  // → /api/rounds
        // 백엔드 필드(course_name, totalScore) → 프론트 필드(course, score) 매핑
        const mapped = res.data.map(r => ({
          id:     r.id,
          course: r.course_name,
          date:   r.date,
          score:  r.totalScore ?? r.score  // totalScore가 없으면 기존 score 사용
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
