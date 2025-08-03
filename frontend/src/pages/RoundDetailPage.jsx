// src/pages/RoundDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import './RoundDetailPage.css';

export default function RoundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(null);

  useEffect(() => {
    const fetchRound = async () => {
      try {
        const res = await axios.get(`/rounds/${id}`);
        setRound(res.data);
      } catch (err) {
        console.error('❌ 상세 라운드 가져오기 실패', err);
      }
    };
    fetchRound();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/rounds/${id}`);
      alert('삭제 완료');
      navigate('/');
    } catch (err) {
      console.error('❌ 삭제 실패', err);
    }
  };

  if (!round) return <div>로딩 중…</div>;

  return (
    <div className="round-detail-container">
      <h1 className="round-detail-title">⛳ 라운드 상세</h1>

      <div className="round-detail-actions">
        <button className="delete-btn" onClick={handleDelete}>
          🗑 삭제
        </button>
      </div>

      <div className="round-detail-summary">
        <p><strong>날짜:</strong> {round.date}</p>
        <p><strong>코스명:</strong> {round.course_name}</p>
        <p><strong>총 스코어:</strong> {round.totalScore}</p>
        <p><strong>FIR:</strong> {round.firPercent}%</p>
        <p><strong>GIR:</strong> {round.girPercent}%</p>
        <p><strong>퍼팅 수:</strong> {round.totalPutts}</p>
      </div>

      <h2 className="round-detail-subtitle">홀별 기록</h2>
      <table className="round-detail-table">
        <thead>
          <tr>
            <th>홀</th>
            <th>파</th>
            <th>스코어</th>
            <th>티샷</th>
            <th>어프로치</th>
            <th>퍼팅</th>
          </tr>
        </thead>
        <tbody>
          {round.holes.map(h => {
            const teeShot = h.shots?.find(s => s.shot_number === 1)?.club ?? '-';
            const approach = h.shots?.find(s => s.shot_number === 2)?.club ?? '-';
            return (
              <tr key={h.id}>
                <td>{h.hole_number}</td>
                <td>{h.par}</td>
                <td>{h.score  ?? '-'}</td>
                <td>{teeShot}</td>
                <td>{approach}</td>
                <td>{h.putts ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
