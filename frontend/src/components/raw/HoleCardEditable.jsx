import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './HoleCardEditable.css';

export default function HoleCardEditable({
  hole,
  shots: shotsProp,                 // 없으면 hole.shots 사용
  onChangeHole,                      // (holeId, patch) => void
  onUpdateShot,                      // (holeId, shotId, patch) => Promise|void
  onDeleteShot,                      // (holeId, shotId) => Promise|void
  onAddShot,                         // (holeId) => void  (새 샷 추가는 부모에서 관리)
}) {
  const h = hole || {};
  const shots = shotsProp ?? h.shots ?? [];

  // ----- 홀 메타 편집 핸들러 -----
  const setPatch = (patch) => onChangeHole?.(h.id, patch);

  const inc = (key, step = 1, min = -99, max = 99) => {
    const curr = Number.isFinite(h[key]) ? h[key] : 0;
    const next = Math.max(min, Math.min(max, curr + step));
    setPatch({ [key]: next });
  };
  const setNum = (key, value, min = -99, max = 99) => {
    const n = value === '' ? null : Number(value);
    const v = n == null || Number.isNaN(n) ? null : Math.max(min, Math.min(max, n));
    setPatch({ [key]: v });
  };
  const toggle = (key) => setPatch({ [key]: !h[key] });
  const setText = (key, value) => setPatch({ [key]: value });

  // ± 스코어 표시
  const rel = Number.isFinite(h.score) ? h.score : null;
  const relLabel = rel == null ? '-' : rel > 0 ? `+${rel}` : `${rel}`;
  const relClass = rel == null ? '' : rel < 0 ? 'good' : rel > 0 ? 'bad' : '';

  // ----- 기존 샷 인라인 편집용 로컬 상태 -----
  // shotId -> editable row
  const [rows, setRows] = useState({});
  useEffect(() => {
    const initial = {};
    shots.forEach(s => {
      initial[s.id] = {
        club: s.club ?? '',
        condition: s.condition ?? '',
        remaining_dist: s.remaining_dist ?? '',
        actual_dist: s.actual_dist ?? '',
        result: s.result ?? '',
        notes: s.notes ?? '',
        shot_number: s.shot_number ?? 1,
      };
    });
    setRows(initial);
  }, [shots]);

  const updateRowField = (shotId, key, value) => {
    setRows(prev => ({ ...prev, [shotId]: { ...prev[shotId], [key]: value } }));
  };

  const diffPatch = (orig, edit) => {
    const patch = {};
    Object.keys(edit).forEach(k => {
      const A = orig[k];
      const B = edit[k];
      // 숫자 필드 정규화
      const numKeys = ['remaining_dist', 'actual_dist', 'shot_number'];
      if (numKeys.includes(k)) {
        const a = A == null ? null : Number(A);
        const b = B === '' ? null : (B == null ? null : Number(B));
        if (!(a == null && b == null) && a !== b) patch[k] = b;
      } else {
        if ((A ?? '') !== (B ?? '')) patch[k] = B;
      }
    });
    return patch;
  };

  const handleSaveShot = async (s) => {
    const edit = rows[s.id];
    if (!edit) return;
    const patch = diffPatch(
      {
        club: s.club ?? '',
        condition: s.condition ?? '',
        remaining_dist: s.remaining_dist ?? null,
        actual_dist: s.actual_dist ?? null,
        result: s.result ?? '',
        notes: s.notes ?? '',
        shot_number: s.shot_number ?? 1,
      },
      edit
    );
    if (!Object.keys(patch).length) return; // 변경 없음
    // 숫자 필드 정리
    if ('remaining_dist' in patch && patch.remaining_dist === '') patch.remaining_dist = null;
    if ('actual_dist' in patch && patch.actual_dist === '') patch.actual_dist = null;

    await onUpdateShot?.(h.id, s.id, patch);
  };

  const handleDeleteShot = async (s) => {
    if (!window.confirm('이 샷을 삭제할까요?')) return;
    await onDeleteShot?.(h.id, s.id);
  };

  return (
    <div className="hc">
      <div className="hc-head">
        <div className="hc-left">
          <div className="hc-num">{h.hole_number}H</div>
          <div className="hc-meta">Par {h.par}</div>
        </div>
      </div>

      {/* 스코어(±) / FIR / GIR / 퍼팅 / 페널티 / 노트 */}
      <div className="hc-stats-grid">
        <div className="hc-card score">
          <div className="chip-title">Score (±)</div>
          <div className={`chip-value ${relClass}`}>{relLabel}</div>
          <div className="stepper">
            <button onClick={() => inc('score', -1)}>-</button>
            <input
              className="num"
              value={h.score ?? ''}
              onChange={e => setNum('score', e.target.value, -20, 20)}
              placeholder="0"
            />
            <button onClick={() => inc('score', 1)}>+</button>
          </div>
        </div>

        <button
          type="button"
          className={`hc-card toggle ${h.fw_hit ? 'ok' : 'no'}`}
          onClick={() => toggle('fw_hit')}
        >
          <div className="chip-title">FIR</div>
          <div className="chip-value">{h.fw_hit ? 'Yes' : 'No'}</div>
        </button>

        <button
          type="button"
          className={`hc-card toggle ${h.gir ? 'ok' : 'no'}`}
          onClick={() => toggle('gir')}
        >
          <div className="chip-title">GIR</div>
          <div className="chip-value">{h.gir ? 'Yes' : 'No'}</div>
        </button>

        <div className="hc-card putts">
          <div className="chip-title">Putts</div>
          <div className="stepper">
            <button onClick={() => inc('putts', -1, 0, 99)}>-</button>
            <input
              className="num"
              value={h.putts ?? ''}
              onChange={e => setNum('putts', e.target.value, 0, 99)}
              placeholder="0"
            />
            <button onClick={() => inc('putts', 1, 0, 99)}>+</button>
          </div>
        </div>

        <div className="hc-card penalties">
          <div className="chip-title">Penalties</div>
          <div className="stepper">
            <button onClick={() => inc('penalties', -1, 0, 10)}>-</button>
            <input
              className="num"
              value={h.penalties ?? ''}
              onChange={e => setNum('penalties', e.target.value, 0, 10)}
              placeholder="0"
            />
            <button onClick={() => inc('penalties', 1, 0, 10)}>+</button>
          </div>
        </div>

        <div className="hc-card notes">
          <div className="chip-title">Notes</div>
          <input
            className="text"
            value={h.notes ?? ''}
            onChange={e => setText('notes', e.target.value)}
            placeholder="예: 바람 강함, 우측 미스"
          />
        </div>
      </div>

      {/* 샷 편집 */}
      <div className="hc-shots-card">
        <div className="hc-shots-head">
          <h4>{h.hole_number}H Shots</h4>
          <button className="btn small" onClick={() => onAddShot?.(h.id)}>+ 새 샷</button>
        </div>

        {shots.length === 0 ? (
          <div className="hc-empty">기존 샷이 없습니다.</div>
        ) : (
          <div className="hc-shots-list">
            {shots.map((s) => {
              const row = rows[s.id] ?? {};
              return (
                <div key={s.id} className="shot-row">
                  <span className="chip ghost">#{row.shot_number}</span>

                  <input
                    className="inp"
                    placeholder="클럽 (예: Driver, 7i)"
                    value={row.club}
                    onChange={e => updateRowField(s.id, 'club', e.target.value)}
                  />

                  <select
                    className="inp"
                    value={row.condition}
                    onChange={e => updateRowField(s.id, 'condition', e.target.value)}
                  >
                    <option value="">라이/상태</option>
                    <option value="tee">티박스</option>
                    <option value="fairway">페어웨이</option>
                    <option value="rough">러프</option>
                    <option value="bunker">벙커</option>
                    <option value="green">그린</option>
                  </select>

                  <input
                    className="inp num"
                    type="number"
                    placeholder="남은거리"
                    value={row.remaining_dist}
                    onChange={e => updateRowField(s.id, 'remaining_dist', e.target.value)}
                  />

                  <input
                    className="inp num"
                    type="number"
                    placeholder="실제거리"
                    value={row.actual_dist}
                    onChange={e => updateRowField(s.id, 'actual_dist', e.target.value)}
                  />

                  <input
                    className="inp"
                    placeholder="결과(예: 좌러프, 온그린)"
                    value={row.result}
                    onChange={e => updateRowField(s.id, 'result', e.target.value)}
                  />

                  <input
                    className="inp"
                    placeholder="메모"
                    value={row.notes}
                    onChange={e => updateRowField(s.id, 'notes', e.target.value)}
                  />

                  <div className="row-actions">
                    <button className="btn outline small" onClick={() => handleSaveShot(s)}>저장</button>
                    <button className="btn danger small" onClick={() => handleDeleteShot(s)}>삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

HoleCardEditable.propTypes = {
  hole: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hole_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    par: PropTypes.number,
    score: PropTypes.number,
    fw_hit: PropTypes.bool,
    gir: PropTypes.bool,
    putts: PropTypes.number,
    penalties: PropTypes.number,
    notes: PropTypes.string,
    shots: PropTypes.array,
  }).isRequired,
  shots: PropTypes.array,
  onChangeHole: PropTypes.func,
  onUpdateShot: PropTypes.func,
  onDeleteShot: PropTypes.func,
  onAddShot: PropTypes.func,
};
