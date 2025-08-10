// src/pages/RoundEditPage.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoundDetail from '../hooks/useRoundDetail';
import * as holeService from '../services/holeService';
import * as roundService from '../services/roundService';
import * as shotService from '../services/shotService';
import HoleCardEditable from '../components/card/HoleCardEditable';
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

  // 홀 목록/패치
  const holes = useMemo(() => round?.holes ?? [], [round]);
  const [patches, setPatches] = useState({}); // { [holeId]: {patch} }

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

  // ----- 샷: 기존/새 -----
  const [existingShotsByHole, setExistingShotsByHole] = useState({}); // { [holeId]: Shot[] }
  const [newShotsByHole, setNewShotsByHole] = useState({});           // { [holeId]: DraftShot[] }

  // 홀 변경 시 각 홀의 기존 샷 불러오기
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (!holes.length) return;
      try {
        const results = await Promise.all(
          holes.map(h => shotService.getShots(h.id).catch(() => []))
        );
        if (!mounted) return;
        const byHole = {};
        const newBuf = {};
        holes.forEach((h, idx) => {
          byHole[h.id] = results[idx] ?? [];
          newBuf[h.id] = [];
        });
        setExistingShotsByHole(byHole);
        setNewShotsByHole(newBuf);
      } catch {
        // 무시
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, [holes]);

  // 새 샷 추가/변경/삭제
  const addNewShot = useCallback((holeId) => {
    setNewShotsByHole(prev => {
      const next = { ...prev };
      const existCount = (existingShotsByHole[holeId]?.length || 0);
      const newCount = (next[holeId]?.length || 0);
      const shot_number = existCount + newCount + 1;
      const draft = {
        shot_number,
        club: '',
        condition: '',
        remaining_dist: '',
        actual_dist: '',
        result: '',
        notes: '',
      };
      next[holeId] = [...(next[holeId] || []), draft];
      return next;
    });
  }, [existingShotsByHole]);

  const updateNewShot = useCallback((holeId, idx, key, value) => {
    setNewShotsByHole(prev => {
      const arr = prev[holeId] ? [...prev[holeId]] : [];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [holeId]: arr };
    });
  }, []);

  const removeNewShot = useCallback((holeId, idx) => {
    setNewShotsByHole(prev => {
      const arr = prev[holeId] ? [...prev[holeId]] : [];
      arr.splice(idx, 1);
      // shot_number 재시퀀스
      const existCount = (existingShotsByHole[holeId]?.length || 0);
      const reseq = arr.map((s, i) => ({ ...s, shot_number: existCount + i + 1 }));
      return { ...prev, [holeId]: reseq };
    });
  }, [existingShotsByHole]);

  // 기존 샷 수정/삭제 (즉시 커밋)
  const handleUpdateShot = async (holeId, shotId, patch) => {
    await shotService.updateShot(shotId, patch);
    setExistingShotsByHole(prev => {
      const next = { ...prev };
      next[holeId] = (next[holeId] ?? []).map(s => s.id === shotId ? { ...s, ...patch } : s);
      return next;
    });
  };

  const handleDeleteShot = async (holeId, shotId) => {
    await shotService.deleteShot(shotId);
    setExistingShotsByHole(prev => {
      const next = { ...prev };
      next[holeId] = (next[holeId] ?? []).filter(s => s.id !== shotId);
      return next;
    });
    // 새 샷 shot_number에 영향 없음(원하면 여기서 새 샷 시퀀스 재조정 가능)
  };

  // 저장(홀 패치 + 새 샷 벌크 생성)
  const totalNewShots = useMemo(
    () => Object.values(newShotsByHole).reduce((sum, arr) => sum + (arr?.length || 0), 0),
    [newShotsByHole]
  );
  const dirtyCount = Object.keys(patches).length + totalNewShots;

  const onSave = async () => {
    if (!round) return;
    try {
      // 라운드 메타 (옵션)
      try {
        await roundService.updateRound?.(roundId, {
          course_name: meta.course_name,
          date: meta.date,
          weather: meta.weather,
        });
      } catch (e) {
        console.warn('updateRound 스킵:', e?.response?.status);
      }

      // 홀 패치
      const holeEntries = Object.entries(patches);
      if (holeEntries.length) {
        await Promise.all(holeEntries.map(([holeId, patch]) =>
          holeService.updateHole(holeId, patch)
        ));
      }

      // 새 샷 벌크 생성
      const shotPromises = [];
      Object.entries(newShotsByHole).forEach(([holeId, drafts]) => {
        if (!drafts?.length) return;
        const payload = drafts.map(s => ({
          shot_number: s.shot_number,
          club: s.club || '',
          condition: s.condition || '',
          remaining_dist: s.remaining_dist === '' ? null : Number(s.remaining_dist),
          actual_dist: s.actual_dist === '' ? null : Number(s.actual_dist),
          result: s.result || '',
          notes: s.notes || null,
        }));
        shotPromises.push(shotService.createShots(holeId, payload));
      });
      if (shotPromises.length) await Promise.all(shotPromises);

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

      {/* 홀 + 샷 */}
      <div className="rep-holes">
      {holes.map(hole => {
  const draftHole = { ...hole, ...(patches[hole.id] ?? {}) }; // ✅ 원본 + 패치 병합
  return (
    <div key={hole.id} className="rep-hole-block">
      <HoleCardEditable
        hole={draftHole}                         // ✅ 병합된 값으로 제어
        shots={existingShotsByHole[hole.id] ?? []}
        onChangeHole={onChangeHole}
        onUpdateShot={handleUpdateShot}
        onDeleteShot={handleDeleteShot}
        onAddShot={() => addNewShot(hole.id)}
      />

      {/* 새 샷 버퍼 UI (필요 시 그대로 유지) */}
      {(newShotsByHole[hole.id] ?? []).length > 0 && (
        <div className="rep-card rep-shots rep-shots-new">
          {(newShotsByHole[hole.id] ?? []).map((s, idx) => (
            <div key={`new-${idx}`} className="rep-shot-row">
              <span className="rep-chip ghost">#{s.shot_number}</span>
              <input
                className="rep-input"
                placeholder="클럽 (예: 7i, Driver)"
                value={s.club}
                onChange={e => updateNewShot(hole.id, idx, 'club', e.target.value)}
              />
              <select
                className="rep-input"
                value={s.condition}
                onChange={e => updateNewShot(hole.id, idx, 'condition', e.target.value)}
              >
                <option value="">라이/상태</option>
                <option value="tee">티박스</option>
                <option value="fairway">페어웨이</option>
                <option value="rough">러프</option>
                <option value="bunker">벙커</option>
                <option value="green">그린</option>
              </select>
              <input
                className="rep-input"
                type="number"
                placeholder="남은거리"
                value={s.remaining_dist}
                onChange={e => updateNewShot(hole.id, idx, 'remaining_dist', e.target.value)}
              />
              <input
                className="rep-input"
                type="number"
                placeholder="실제거리"
                value={s.actual_dist}
                onChange={e => updateNewShot(hole.id, idx, 'actual_dist', e.target.value)}
              />
              <input
                className="rep-input"
                placeholder="결과(예: 좌러프, 온그린)"
                value={s.result}
                onChange={e => updateNewShot(hole.id, idx, 'result', e.target.value)}
              />
              <input
                className="rep-input"
                placeholder="메모"
                value={s.notes}
                onChange={e => updateNewShot(hole.id, idx, 'notes', e.target.value)}
              />
              <button
                className="rep-btn danger small"
                onClick={() => removeNewShot(hole.id, idx)}
              >
                제거
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}
      </div>
    </div>
  );
}
