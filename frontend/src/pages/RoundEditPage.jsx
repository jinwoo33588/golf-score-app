import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoundDetail from '../hooks/useRoundDetail';
import * as holeService from '../services/holeService';
import * as roundService from '../services/roundService';
import HoleEditRow from '../components/HoleEditRow';
import './RoundEditPage.css';

export default function RoundEditPage() {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { round, loading, error } = useRoundDetail(roundId);

  // 라운드 메타
  const [meta, setMeta] = useState({ course_name: '', date: '', weather: '' });

  // 최초 로드 시 메타 동기화 (동일값이면 setState 스킵)
  React.useEffect(() => {
    if (!round) return;
    const next = {
      course_name: round.course_name ?? '',
      date: round.date?.slice(0,10) ?? '',
      weather: round.weather ?? '',
    };
    setMeta(prev =>
      prev.course_name === next.course_name &&
      prev.date === next.date &&
      prev.weather === next.weather
        ? prev
        : next
    );
  }, [round]);

  // 각 홀 patch 누적
  const [patches, setPatches] = useState({});
  const holes = useMemo(() => round?.holes ?? [], [round]);

  // 🔒 onChange 콜백 메모이즈 + 동일 패치면 업데이트 스킵
  const onChangeHole = useCallback((holeId, patch) => {
    setPatches(prev => {
      const prevPatch = prev[holeId];
      const same =
        prevPatch &&
        Object.keys(patch).length === Object.keys(prevPatch).length &&
        Object.keys(patch).every(k => prevPatch[k] === patch[k]);
      return same ? prev : { ...prev, [holeId]: patch };
    });
  }, []);

  const onSave = async () => {
    if (!round) return;
    try {
      // (옵션) 라운드 메타 저장 — 백엔드에 PUT /rounds/:id 있으면 활성화
      try {
        await roundService.updateRound?.(roundId, {
          course_name: meta.course_name,
          date: meta.date,
          weather: meta.weather,
        });
      } catch (e) {
        // 미구현이면 스킵
        console.warn('updateRound 스킵:', e?.response?.status);
      }

      // ✅ 홀 저장 (변경된 것만)
      const entries = Object.entries(patches);
      if (entries.length) {
        await Promise.all(entries.map(([holeId, patch]) =>
          holeService.updateHole(holeId, patch)
        ));
      }

      alert('저장 완료!');
      navigate(`/rounds/${roundId}`);
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const dirtyCount = Object.keys(patches).length;

  if (loading) return <div className="rep-status">로딩중…</div>;
  if (error)   return <div className="rep-status error">⚠️ {error.message || '로드 실패'}</div>;
  if (!round)  return <div className="rep-status">데이터가 없습니다.</div>;

  return (
    <div className="rep-container">
      <div className="rep-header">
        <button className="rep-btn ghost" onClick={() => navigate(-1)}>← 뒤로</button>
        <h1>라운드 수정</h1>
        <div className="rep-spacer" />
        <button className="rep-btn primary" onClick={onSave}>
          저장{dirtyCount ? ` (${dirtyCount})` : ''}
        </button>
      </div>

      {/* 라운드 메타 */}
      <div className="rep-card">
        <div className="rep-grid">
          <label className="rep-field">
            <span>코스명</span>
            <input
              className="rep-input"
              value={meta.course_name}
              onChange={e => setMeta(m => ({ ...m, course_name: e.target.value }))}
              placeholder="코스명"
            />
          </label>

          <label className="rep-field">
            <span>날짜</span>
            <input
              type="date"
              className="rep-input"
              value={meta.date}
              onChange={e => setMeta(m => ({ ...m, date: e.target.value }))}
            />
          </label>

          <label className="rep-field">
            <span>날씨</span>
            <input
              className="rep-input"
              value={meta.weather}
              onChange={e => setMeta(m => ({ ...m, weather: e.target.value }))}
              placeholder="-"
            />
          </label>
        </div>
      </div>

      {/* 홀 편집 */}
      <div className="rep-holes">
        {holes.map(h => (
          <HoleEditRow key={h.id} hole={h} onChange={onChangeHole} />
        ))}
      </div>
    </div>
  );
}
