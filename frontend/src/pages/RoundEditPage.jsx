// src/pages/RoundEditPage.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoundDetail from '../hooks/useRoundDetail';
import * as holeService from '../services/holeService';
import * as roundService from '../services/roundService';
// 🔁 HoleCardEditable → HoleCardTest 로 통일
import HoleCardTest from '../components/card/HoleCardTest';
import './RoundEditPage.css';

export default function RoundEditPage() {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { round, loading, error } = useRoundDetail(roundId);

  // 라운드 메타
  const [meta, setMeta] = useState({ course_name: '', date: '', weather: '' });
  useEffect(() => {
    if (!round) return;
    const next = {
      course_name: round.course_name ?? '',
      date: round.date?.slice(0, 10) ?? '',
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

  // 홀 목록
  const holes = useMemo(() => round?.holes ?? [], [round]);

  // 각 홀별 patch 누적
  const [patches, setPatches] = useState({}); // { [holeId]: { ...diff } }

  // 변경점 계산 (필요한 필드만 비교)
  const diffHole = (base, next) => {
    const keys = ['par', 'score', 'putts', 'penalties', 'fir', 'gir', 'notes', 'shots'];
    const patch = {};
    for (const k of keys) {
      const a = base?.[k];
      const b = next?.[k];
      if (k === 'shots') {
        const sa = JSON.stringify(a ?? []);
        const sb = JSON.stringify(b ?? []);
        if (sa !== sb) patch[k] = b ?? [];
      } else if (a !== b) {
        patch[k] = b;
      }
    }
    return patch;
  };

  // 카드에서 온 updatedHole을 받아서 해당 홀의 patch 로 축약 저장
  const onChangeHole = useCallback((holeId, updatedHole, baseHole) => {
    const delta = diffHole(baseHole, updatedHole);
    setPatches(prev => {
      const merged = { ...(prev[holeId] ?? {}), ...delta };
      // 변경 없으면 그대로
      const prevMerged = prev[holeId] ?? {};
      const same =
        Object.keys(merged).length === Object.keys(prevMerged).length &&
        Object.keys(merged).every(k => merged[k] === prevMerged[k]);
      return same ? prev : { ...prev, [holeId]: merged };
    });
  }, []);

  const dirtyCount = Object.keys(patches).length;

  const onSave = async () => {
    if (!round) return;
    try {
      // 1) 라운드 메타
      try {
        await roundService.updateRound?.(roundId, {
          course_name: meta.course_name,
          date: meta.date,
          weather: meta.weather,
        });
      } catch (e) {
        console.warn('updateRound 스킵 또는 실패:', e?.response?.status ?? e?.message);
      }

      // 2) 홀 패치 일괄 저장
      const entries = Object.entries(patches);
      if (entries.length) {
        await Promise.all(
          entries.map(async ([holeId, patch]) => {
            // ⚠️ 만약 API가 holeService.updateHole에서 shots 전체 교체를 지원하지 않으면,
            // 여기서 shots를 분리해 shotService로 upsert/delete 처리하도록 분기하세요.
            await holeService.updateHole(holeId, patch);
          })
        );
      }

      alert('저장 완료!');
      navigate(`/rounds/${roundId}`);
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

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

      {/* 홀 편집: HoleCardTest + mode="edit" */}
      <div className="rep-holes">
        {holes.map((hole) => {
          // 화면상 값 = 원본 + 누적 패치 병합 (양방향 제어)
          const draftHole = { ...hole, ...(patches[hole.id] ?? {}) };
          return (
            <div key={hole.id} className="rep-hole-block">
              <HoleCardTest
                hole={draftHole}
                mode="edit"         // ✅ 편집 모드
                showShots           // 샷 모달 사용
                onChange={(updated) => onChangeHole(hole.id, updated, draftHole)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
