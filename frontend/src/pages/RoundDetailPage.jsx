// src/pages/RoundDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoundDetail from '../hooks/useRoundDetail';

import './RoundDetailPage.css';

export default function RoundDetailPage() {
  const { roundId } = useParams();  // URL param 이름과 일치시킵니다
  const navigate = useNavigate();
  const { round, loading, error, deleteRound } = useRoundDetail(roundId);

  if (loading) return <div>로딩중.</div>;
  if (error)   return <div>⚠️ 로드 실패: {error.message}</div>;
  if (!round) return <div>데이터가 없습니다.</div>;

  const onDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteRound();
    navigate('/rounds');
  };

  return (
    <div className="round-detail-container">
      <h1 className="round-detail-title">⛳ 라운드 상세</h1>

      <div className="round-detail-actions">
        <button className="delete-btn" onClick={onDelete}>
          🗑 삭제
        </button>
      </div>

      <div className="round-detail-summary">
        <p><strong>날짜:</strong> {round.date}</p>
        <p><strong>코스명:</strong> {round.course}</p>
        <p><strong>총 스코어:</strong> {round.score}</p>
        <p><strong>FIR:</strong> {round.fir}%</p>
        <p><strong>GIR:</strong> {round.gir}%</p>
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
                <td>{h.hole}</td>
                <td>{h.par}</td>
                <td>{h.score  ?? '-'}</td>
                <td>{h.teeShot}</td>
                <td>{h.approach}</td>
                <td>{h.putts ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
