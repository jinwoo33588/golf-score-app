import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';

const LS_KEY = 'uiSandbox18_v2';

// ---------- 유틸 ----------
const pad2 = (n) => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
};
const signLabel = (n) => (n > 0 ? `+${n}` : `${n}`);
const clamp = (v, min=null, max=null) => {
  let x = v;
  if (min != null) x = Math.max(min, x);
  if (max != null) x = Math.min(max, x);
  return x;
};

// 초기 18홀 생성
function createInitialHoles() {
  return Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: 4,
    score: 0,        // ± 스코어(파 대비)
    putts: 2,
    penalties: 0,
    fir: null,       // true/false/null
    gir: null,
    notes: '',
    shots: []
  }));
}

// ---------- 코스 PAR 프리셋 ----------
const COURSE_PRESETS = {
  '아시아나CC': [4, 5, 4, 3, 4, 3, 5, 3, 4,  4, 4, 5, 3, 4, 4, 5, 3, 4],
  // 추가 코스는 여기에
};

// ---------- 공통 UI ----------
function YesNoToggle({ label, value, onChange }) {
  return (
    <div className="ui-row">
      <div className="ui-label">{label}</div>
      <div className="ui-toggle">
        <button
          type="button"
          className={`ui-pill ${value === true ? 'active' : ''}`}
          onClick={() => onChange(true)}
        >YES</button>
        <button
          type="button"
          className={`ui-pill ${value === false ? 'active' : ''}`}
          onClick={() => onChange(false)}
        >NO</button>
      </div>
    </div>
  );
}

function ShotEditor({ shot, onChange, onRemove }) {
  return (
    <div className="ui-card shot-item">
      <div className="shot-row">
        <input
          placeholder="클럽"
          value={shot.club || ''}
          onChange={e => onChange('club', e.target.value)}
        />
        <input
          placeholder="상태(페어웨이/러프/벙커)"
          value={shot.condition || ''}
          onChange={e => onChange('condition', e.target.value)}
        />
      </div>
      <div className="shot-row">
        <input
          placeholder="남은거리(m)"
          inputMode="numeric"
          value={shot.remaining_dist ?? ''}
          onChange={e => onChange('remaining_dist', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          placeholder="실제거리(m)"
          inputMode="numeric"
          value={shot.actual_dist ?? ''}
          onChange={e => onChange('actual_dist', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
      <div className="shot-row">
        <input
          placeholder="결과(그린우/해저드 등)"
          value={shot.result || ''}
          onChange={e => onChange('result', e.target.value)}
        />
        <input
          placeholder="메모"
          value={shot.notes || ''}
          onChange={e => onChange('notes', e.target.value)}
        />
      </div>
      <div className="ui-actions">
        <button type="button" className="ui-danger" onClick={onRemove}>샷 삭제</button>
      </div>
    </div>
  );
}

function HoleUnit({ hole, onChange }) {
  const h = hole || {};
  const set = (key, val) => onChange({ ...h, [key]: val });

  const addShot = () => {
    const next = [...(h.shots || [])];
    next.push({
      club: '', condition: '', remaining_dist: '', actual_dist: '',
      result: '', notes: ''
    });
    set('shots', next);
  };
  const updateShot = (idx, key, val) => {
    const next = [...(h.shots || [])];
    next[idx] = { ...next[idx], [key]: val };
    set('shots', next);
  };
  const removeShot = (idx) => {
    const next = [...(h.shots || [])];
    next.splice(idx, 1);
    set('shots', next);
  };

  return (
    <div className="ui-card">
      <div className="hole-header sticky-top">
        <div className="hole-title">🕳️ {h.hole_number}H</div>
        <div className="hole-par">
          <span>Par</span>
          <input
            style={{maxWidth:90}}
            inputMode="numeric"
            value={h.par ?? 4}
            onChange={e => set('par', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="kv">
        <div className="kv-item">
          <div className="kv-t">스코어(±)</div>
          <div className="kv-v">{signLabel(h.score ?? 0)}</div>
        </div>
        <div className="kv-item">
          <div className="kv-t">퍼팅</div>
          <div className="kv-v">{h.putts ?? 0}</div>
        </div>
        <div className="kv-item">
          <div className="kv-t">FIR</div>
          <div className="kv-v">{h.fir == null ? '—' : h.fir ? 'YES' : 'NO'}</div>
        </div>
        <div className="kv-item">
          <div className="kv-t">GIR</div>
          <div className="kv-v">{h.gir == null ? '—' : h.gir ? 'YES' : 'NO'}</div>
        </div>
      </div>

      <YesNoToggle label="FIR" value={h.fir} onChange={v => set('fir', v)} />
      <YesNoToggle label="GIR" value={h.gir} onChange={v => set('gir', v)} />

      <div className="ui-row" style={{alignItems:'flex-start'}}>
        <div className="ui-label" style={{marginTop:8}}>노트</div>
        <textarea
          className="ui-textarea"
          placeholder="코스 메모, 바람, 라이 등"
          value={h.notes || ''}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div className="ui-section-title">🎯 샷</div>
      {(h.shots || []).map((s, i) => (
        <ShotEditor
          key={i}
          shot={s}
          onChange={(k, v) => updateShot(i, k, v)}
          onRemove={() => removeShot(i)}
        />
      ))}
      <div className="ui-actions">
        <button type="button" className="ui-secondary" onClick={addShot}>샷 추가</button>
      </div>
    </div>
  );
}

// ---------- 롱프레스 훅 ----------
function useHold(action, deps = [], speed = 110) {
  const timer = useRef(null);
  const start = useCallback(() => {
    action();
    timer.current = setInterval(action, speed);
  }, deps); // eslint-disable-line
  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  return {
    onMouseDown: start, onMouseUp: stop, onMouseLeave: stop,
    onTouchStart: start, onTouchEnd: stop, onTouchCancel: stop,
  };
}

// ---------- 메인 페이지 ----------
export default function UISandbox() {
  // 스타일(외부 CSS 없이 사용)
  const styles = `
  :root { --pad:16px; --radius:16px; --safe: env(safe-area-inset-bottom); }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root { height:100%; }
  body { background:#f8fafc; font-size:16px; }
  .wrap { max-width: 780px; margin:0 auto; padding: var(--pad); padding-bottom: 120px; }
  h1 { font-size:22px; font-weight:800; margin: 0 0 8px; }
  .sub { color:#666; font-size:12px; margin-bottom: 12px; }

  .ui-card { background:#fff; border:1px solid #eee; border-radius: var(--radius); padding: var(--pad); box-shadow:0 2px 8px rgba(0,0,0,.04); }
  .stack { display:grid; gap:12px; }

  .ui-row { display:flex; align-items:center; justify-content:space-between; margin:12px 0; gap:12px; }
  .ui-label { font-weight:600; font-size:14px; white-space:nowrap; }

  .ui-toggle { display:flex; gap:8px; }
  .ui-pill { padding:12px 18px; border-radius:999px; border:1px solid #ddd; background:#fff; font-weight:700; }
  .ui-pill.active { border-color:#0ea5e9; box-shadow:0 0 0 2px rgba(14,165,233,.15); }

  .ui-text { width:100%; height:48px; border:1px solid #ddd; border-radius:12px; padding:10px; font-size:16px; }
  .ui-textarea { width:100%; min-height:88px; border:1px solid #ddd; border-radius:12px; padding:12px; font-size:16px; }

  .ui-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .ui-primary { background:#0ea5e9; color:#fff; border:none; padding:14px 16px; border-radius:14px; font-weight:800; }
  .ui-secondary { background:#f3f4f6; color:#111; border:none; padding:14px 16px; border-radius:14px; font-weight:700; }
  .ui-danger { background:#ef4444; color:#fff; border:none; padding:14px 16px; border-radius:14px; font-weight:800; }

  .top-row { display:grid; gap:12px; grid-template-columns: 1fr; }
  .top-row .grid2 { display:grid; gap:12px; grid-template-columns: 1fr 1fr; }

  .hole-tabs { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; -ms-overflow-style:none; }
  .hole-tabs::-webkit-scrollbar { display:none; }
  .hole-pill { padding:12px 14px; border:1px solid #ddd; border-radius:999px; background:#fff; font-weight:800; min-width:56px; text-align:center; }
  .hole-pill.active { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
  .hole-pill.done { border-color:#16a34a; }

  .sticky-top { position: sticky; top: -8px; background:#fff; z-index: 2; padding-bottom: 6px; margin-bottom: 8px; }

  .kv { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:8px; }
  .kv-item { background:#f9fafb; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center; }
  .kv-t { font-size:12px; color:#666; }
  .kv-v { font-size:18px; font-weight:800; margin-top:4px; }

  /* 퀵패드 */
  .quickpad {
    position: fixed; left: 0; right: 0; bottom: 0;
    padding: 10px 12px calc(10px + var(--safe));
    background: rgba(255,255,255,.96);
    backdrop-filter: saturate(180%) blur(6px);
    border-top: 1px solid #e5e7eb;
  }
  .qp-row { max-width: 780px; margin:0 auto; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap:8px; align-items:center; }
  .qp-big { height:56px; font-size:22px; border-radius:14px; border:1px solid #ddd; background:#fff; font-weight:900; }
  .qp-ghost { height:56px; border-radius:14px; border:1px dashed #ddd; background:#fff; font-weight:800; }
  .qp-primary { height:56px; border:none; border-radius:14px; background:#0ea5e9; color:#fff; font-weight:900; }
  .qp-pill { height:56px; border-radius:999px; border:1px solid #ddd; background:#fff; font-weight:800; }
  .qp-pill.active { border-color:#0ea5e9; box-shadow:0 0 0 2px rgba(14,165,233,.15); }

  .summary { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; }
  .summary .box { background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center; }
  .summary .t { font-size:12px; color:#666; }
  .summary .v { font-size:18px; font-weight:800; margin-top:4px; }
  `;

  // 상태
  const [date, setDate] = useState(() => todayStr());
  const [course, setCourse] = useState('아시아나CC');
  const [holes, setHoles] = useState(createInitialHoles);
  const [active, setActive] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const hasAppliedPresetRef = useRef(false);

  // 복구
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.holes?.length === 18) setHoles(parsed.holes);
      if (parsed?.course) setCourse(parsed.course);
      if (parsed?.date) setDate(parsed.date);
    } catch(e) {/* ignore */}
  }, []);

  // 저장
  const persist = useCallback((nextHoles = holes, nextDate = date, nextCourse = course) => {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: nextDate, course: nextCourse, holes: nextHoles }));
    setSavedAt(new Date());
  }, [holes, date, course]);

  const updateHole = (idx, next) => {
    const copy = [...holes];
    copy[idx] = next;
    setHoles(copy);
    persist(copy);
  };
  const updateDate = (v) => { setDate(v); persist(holes, v, course); };
  const updateCourse = (v) => { setCourse(v); persist(holes, date, v); };

  useEffect(() => {
    const handler = () => persist();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [persist]);

  // 아시아나 PAR 자동/수동 적용
  const applyParPreset = useCallback((name) => {
    const arr = COURSE_PRESETS[name];
    if (!arr || arr.length !== 18) return false;
    const next = holes.map((h, i) => ({ ...h, par: Number(arr[i]) }));
    setHoles(next);
    persist(next, date, course);
    setSavedAt(new Date());
    return true;
  }, [holes, persist, date, course]);

  useEffect(() => {
    if (hasAppliedPresetRef.current) return;
    if (course === '아시아나CC') {
      const allDefault = holes.every(h => h.par == null || Number(h.par) === 4);
      if (allDefault) {
        if (applyParPreset('아시아나CC')) hasAppliedPresetRef.current = true;
      }
    }
  }, [course, holes, applyParPreset]);

  // 합계/비율
  const summary = useMemo(() => {
    const totalRel = holes.reduce((s, h) => s + (Number(h.score) || 0), 0);
    const totalPutts = holes.reduce((s, h) => s + (Number(h.putts) || 0), 0);
    const firCount = holes.filter(h => h.fir === true).length;
    const firValid  = holes.filter(h => h.fir !== null).length;
    const girCount = holes.filter(h => h.gir === true).length;
    const girValid  = holes.filter(h => h.gir !== null).length;
    const firPct = firValid ? Math.round((firCount / firValid) * 100) : null;
    const girPct = girValid ? Math.round((girCount / girValid) * 100) : null;
    return { totalRel, totalPutts, firPct, girPct };
  }, [holes]);

  // 액션
  const resetAll = () => {
    if (!window.confirm('모든 입력을 초기화할까요?')) return;
    const init = createInitialHoles();
    const d = todayStr();
    setHoles(init);
    setCourse('아시아나CC');
    setDate(d);
    persist(init, d, '아시아나CC');
    hasAppliedPresetRef.current = false;
  };

  const copyJSON = async () => {
    const payload = { date, course, holes };
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert('JSON 복사 완료!');
    } catch {
      alert('복사 실패. 내보내기를 사용하세요.');
    }
  };

  const exportJSON = () => {
    const payload = { date, course, holes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `golf-round-${course}-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareJSON = async () => {
    try {
      const payload = { date, course, holes };
      const file = new File([JSON.stringify(payload, null, 2)], `golf-round-${course}-${date}.json`, { type: 'application/json' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Golf Round', text: `${course} ${date}`, files: [file] });
      } else {
        exportJSON();
      }
    } catch { /* ignore */ }
  };

  const gotoPrev = () => setActive(a => Math.max(0, a - 1));
  const gotoNext = () => setActive(a => Math.min(17, a + 1));

  // 스와이프 제스처
  const touchRef = useRef({ x: 0, t: 0 });
  const onTouchStart = (e) => {
    touchRef.current = { x: e.changedTouches[0].clientX, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (dt < 600 && Math.abs(dx) > 60) {
      if (dx < 0) gotoNext(); else gotoPrev();
    }
  };

  // 퀵패드 조작
  const bumpScore = (delta) => {
    const h = holes[active];
    updateHole(active, { ...h, score: clamp((h.score ?? 0) + delta, -5, 10) });
  };
  const bumpPutts = (delta) => {
    const h = holes[active];
    updateHole(active, { ...h, putts: clamp((h.putts ?? 0) + delta, 0, 10) });
  };
  const toggleFIR = () => {
    const h = holes[active];
    const next = h.fir === true ? false : h.fir === false ? null : true; // true -> false -> null
    updateHole(active, { ...h, fir: next });
  };
  const toggleGIR = () => {
    const h = holes[active];
    const next = h.gir === true ? false : h.gir === false ? null : true;
    updateHole(active, { ...h, gir: next });
  };

  // 롱프레스 핸들러
  const holdDecScore = useHold(() => bumpScore(-1), [holes, active]);
  const holdIncScore = useHold(() => bumpScore(+1), [holes, active]);
  const holdDecPutts = useHold(() => bumpPutts(-1), [holes, active]);
  const holdIncPutts = useHold(() => bumpPutts(+1), [holes, active]);

  // 렌더
  const activeHole = holes[active];
  const activeDone = (h) => (h.putts ?? 0) > 0 || h.fir != null || h.gir != null || (h.score ?? 0) !== 0;

  return (
    <div className="wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <style>{styles}</style>

      <h1>⛳ 라운드 입력(모바일 최적화)</h1>
      <div className="sub">{savedAt ? `저장됨: ${savedAt.toLocaleTimeString()}` : '입력 즉시 저장'}</div>

      <div className="stack" style={{marginBottom:12}}>
        <div className="ui-card">
          <div className="top-row">
            <div className="grid2">
              <div>
                <div className="ui-label">날짜</div>
                <input
                  type="date"
                  className="ui-text"
                  value={date}
                  onChange={e => updateDate(e.target.value)}
                />
              </div>
              <div>
                <div className="ui-label">코스</div>
                <input
                  className="ui-text"
                  value={course}
                  onChange={e => updateCourse(e.target.value)}
                  placeholder="코스명 입력"
                />
              </div>
            </div>

            <div className="summary">
              <div className="box">
                <div className="t">총 스코어(±)</div>
                <div className="v">{signLabel(summary.totalRel)}</div>
              </div>
              <div className="box">
                <div className="t">퍼팅 합</div>
                <div className="v">{summary.totalPutts}</div>
              </div>
              <div className="box">
                <div className="t">FIR</div>
                <div className="v">{summary.firPct == null ? '—' : `${summary.firPct}%`}</div>
              </div>
              <div className="box">
                <div className="t">GIR</div>
                <div className="v">{summary.girPct == null ? '—' : `${summary.girPct}%`}</div>
              </div>
            </div>

            <div className="ui-actions">
              <button className="ui-secondary" onClick={() => applyParPreset(course)}>코스 파 불러오기</button>
              <button className="ui-primary" onClick={shareJSON}>공유/내보내기</button>
              <button className="ui-secondary" onClick={copyJSON}>JSON 복사</button>
              <button className="ui-danger" onClick={resetAll}>초기화</button>
            </div>
          </div>

          <div className="ui-card" style={{marginTop:12}}>
            <div className="hole-tabs">
              {holes.map((h, i) => (
                <button
                  key={i}
                  className={`hole-pill ${i === active ? 'active' : ''} ${activeDone(h) ? 'done' : ''}`}
                  onClick={() => setActive(i)}
                >
                  {h.hole_number}H
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 활성 홀 상세 */}
        <HoleUnit hole={activeHole} onChange={(next) => updateHole(active, next)} />
      </div>

      {/* 하단 퀵패드 (큰 버튼, 한 손 조작) */}
      <div className="quickpad">
        <div className="qp-row">
          {/* 스코어 */}
          <button className="qp-big" {...holdDecScore} onClick={() => bumpScore(-1)}>−</button>
          <button className="qp-pill" onClick={toggleFIR} style={{fontWeight:900}}>{activeHole.fir ? 'FIR ✓' : (activeHole.fir === false ? 'FIR ✗' : 'FIR •')}</button>
          <button className="qp-primary" onClick={gotoPrev}>◀ 이전</button>
          <button className="qp-primary" onClick={gotoNext}>다음 ▶</button>
          <button className="qp-big" {...holdIncScore} onClick={() => bumpScore(+1)}>＋</button>

          {/* 퍼팅 */}
          <button className="qp-big" {...holdDecPutts} onClick={() => bumpPutts(-1)}>−</button>
          <div className="qp-ghost" style={{display:'grid', placeItems:'center'}}>{`퍼팅 ${activeHole.putts ?? 0}`}</div>
          <button className="qp-pill" onClick={toggleGIR} style={{fontWeight:900}}>{activeHole.gir ? 'GIR ✓' : (activeHole.gir === false ? 'GIR ✗' : 'GIR •')}</button>
          <div className="qp-ghost" style={{display:'grid', placeItems:'center'}}>{`스코어 ${signLabel(activeHole.score ?? 0)}`}</div>
          <button className="qp-big" {...holdIncPutts} onClick={() => bumpPutts(+1)}>＋</button>
        </div>
      </div>
    </div>
  );
}
