// src/pages/RoundDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoundDetail from '../hooks/useRoundDetail';
// ✅ 기존 HoleCard 대신 테스트 컴포넌트 사용
import HoleCardTest from '../components/card/HoleCardTest';
import './RoundDetailPage.css';

export default function RoundDetailPage() {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { round, loading, error, deleteRound } = useRoundDetail(roundId);

  const holes = round?.holes ?? [];

  const handleDelete = async () => {
    if (!window.confirm('정말 이 라운드를 삭제할까요?')) return;
    try {
      await deleteRound();
      navigate('/rounds');
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    navigate(`/rounds/${roundId}/edit`);
  };

  if (loading) return <div className="rdp-status">로딩중…</div>;
  if (error)   return <div className="rdp-status error">⚠️ {error.message || '로드 실패'}</div>;
  if (!round)  return <div className="rdp-status">데이터가 없습니다.</div>;

  // 총 타수(실타수) = Σ(par + score)
  const totalStrokes = (() => {
    if (!holes.length) return null;
    let sum = 0;
    for (const h of holes) {
      if (typeof h.par !== 'number' || typeof h.score !== 'number') return null;
      sum += Number(h.par) + Number(h.score);
    }
    return sum;
  })();

  const totalScoreSigned =
    typeof round.totalScore === 'number'
      ? (round.totalScore > 0 ? `+${round.totalScore}` : `${round.totalScore}`)
      : null;

  const totalClass =
    typeof round.totalScore === 'number'
      ? round.totalScore < 0
        ? 'good'
        : round.totalScore > 0
        ? 'bad'
        : ''
      : '';

  return (
    <div className="rdp-container">
      {/* 헤더 */}
      <div className="rdp-header">
        <button className="rdp-btn ghost" onClick={() => navigate(-1)}>← 뒤로</button>
        <div className="rdp-title">
          <h1>⛳ {round.course_name}</h1>
          <div className="rdp-subtitle">
            <span>{round.date?.slice(0, 10) || '-'}</span>
            <span className="divider">·</span>
            <span>날씨: {round.weather || '-'}</span>
          </div>
        </div>
        <div className="rdp-actions">
          <button className="rdp-btn" onClick={handleEdit}>수정</button>
          <button className="rdp-btn danger" onClick={handleDelete}>삭제</button>
        </div>
      </div>

      {/* 라운드 요약 통계 */}
      <div className="rdp-stats">
        <div className="rdp-stat">
          <div className="label">총 스코어</div>
          <div className={`value ${totalClass}`}>
            {totalStrokes ?? '-'}
            {totalScoreSigned != null && ` (${totalScoreSigned})`}
          </div>
        </div>
        <div className="rdp-stat">
          <div className="label">퍼팅 합계</div>
          <div className="value">{round.totalPutts ?? '-'}</div>
        </div>
        <div className="rdp-stat">
          <div className="label">FIR</div>
          <div className="value">{round.firPercent ?? 0}%</div>
        </div>
        <div className="rdp-stat">
          <div className="label">GIR</div>
          <div className="value">{round.girPercent ?? 0}%</div>
        </div>
      </div>

      {/* 홀 목록 (✅ HoleCardTest 사용) */}
      <div className="rdp-holes">
        {holes.map((h) => (
          <HoleCardTest
            key={h.id}
            hole={h}
            mode="view"          // 상세 페이지는 보기 모드
            onChange={() => {}}  // view 모드라 no-op
            showShots            // 샷 모달 버튼 표시
          />
        ))}
      </div>
    </div>
  );
}
