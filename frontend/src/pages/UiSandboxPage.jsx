import React, { useEffect, useMemo, useState, useCallback } from 'react';

const LS_KEY = 'uiSandbox18_v1';

// ---------- 유틸 ----------
const pad2 = (n) => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
};
const signLabel = (n) => (n > 0 ? `+${n}` : `${n}`);

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

// ---------- 공통 UI ----------
function NumberStepper({ label, value, onChange, min = null, max = null, step = 1 }) {
  const clamp = (v) => {
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    return v;
  };
  const dec = () => onChange(clamp((value ?? 0) - step));
  const inc = () => onChange(clamp((value ?? 0) + step));

  const onInput = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') return onChange('');
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  return (
    <div className="ui-row">
      <div className="ui-label">{label}</div>
      <div className="ui-stepper">
        <button type="button" className="ui-btn" onClick={dec} aria-label={`${label} 감소`}>−</button>
        <input
          className="ui-input-number"
          inputMode="numeric"
          value={value ?? 0}
          onChange={onInput}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="done"
        />
        <button type="button" className="ui-btn" onClick={inc} aria-label={`${label} 증가`}>＋</button>
      </div>
    </div>
  );
}

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

// ---------- 샷 편집 ----------
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

// ---------- 1홀 단위 카드 ----------
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
      <div className="hole-header">
        <div className="hole-title">🕳️ {h.hole_number}H</div>
        <div className="hole-par">
          <span>Par</span>
          <input
            style={{maxWidth:80}}
            inputMode="numeric"
            value={h.par ?? 4}
            onChange={e => set('par', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>

      <NumberStepper label="스코어(±)" value={h.score ?? 0} min={-5} max={10} onChange={v => set('score', v)} />
      <NumberStepper label="퍼팅 수"   value={h.putts ?? 0} min={0}  max={10} onChange={v => set('putts', v)} />
      <NumberStepper label="페널티 개수" value={h.penalties ?? 0} min={0} max={10} onChange={v => set('penalties', v)} />

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

// ---------- 메인 페이지 ----------
export default function UISandbox() {
  // 스타일(외부 CSS 없이 사용)
  const styles = `
  :root { --pad:16px; --radius:16px; }
  * { box-sizing: border-box; }
  body { background:#f8fafc; }
  .wrap { max-width: 760px; margin:0 auto; padding: var(--pad); padding-bottom: 96px; }
  h1 { font-size:22px; font-weight:800; margin: 0 0 8px; }
  .sub { color:#666; font-size:12px; margin-bottom: 12px; }

  .ui-card { background:#fff; border:1px solid #eee; border-radius: var(--radius); padding: var(--pad); box-shadow:0 2px 8px rgba(0,0,0,.04); }
  .stack { display:grid; gap:12px; }

  .ui-row { display:flex; align-items:center; justify-content:space-between; margin:12px 0; gap:12px; }
  .ui-label { font-weight:600; font-size:14px; white-space:nowrap; }

  .ui-stepper { display:flex; align-items:center; gap:8px; }
  .ui-btn { min-width:48px; height:48px; border-radius:12px; border:1px solid #ddd; background:#fff; font-size:22px; }
  .ui-input-number {
    width:88px; height:48px; text-align:center; border:1px solid #ddd; border-radius:10px; font-size:16px;
    -webkit-appearance: none; appearance: none;
  }

  .ui-toggle { display:flex; gap:8px; }
  .ui-pill { padding:10px 16px; border-radius:999px; border:1px solid #ddd; background:#fff; font-weight:600; }
  .ui-pill.active { border-color:#0ea5e9; box-shadow:0 0 0 2px rgba(14,165,233,.15); }

  .ui-text { width:100%; height:44px; border:1px solid #ddd; border-radius:10px; padding:10px; font-size:16px; }
  .ui-textarea { width:100%; min-height:88px; border:1px solid #ddd; border-radius:12px; padding:10px; font-size:16px; }

  .ui-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .ui-primary { background:#0ea5e9; color:#fff; border:none; padding:12px 16px; border-radius:12px; }
  .ui-secondary { background:#f3f4f6; color:#111; border:none; padding:12px 16px; border-radius:12px; }
  .ui-danger { background:#ef4444; color:#fff; border:none; padding:12px 16px; border-radius:12px; }

  .top-row { display:grid; gap:12px; grid-template-columns: 1fr; }
  .top-row .grid2 { display:grid; gap:12px; grid-template-columns: 1fr 1fr; }

  .hole-tabs { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; -ms-overflow-style:none; }
  .hole-tabs::-webkit-scrollbar { display:none; }
  .hole-pill { padding:10px 12px; border:1px solid #ddd; border-radius:999px; background:#fff; font-weight:700; min-width:52px; text-align:center; }
  .hole-pill.active { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }

  .sticky-bottom {
    position: fixed; left: 0; right: 0; bottom: 0; padding: 8px 12px;
    background: linear-gradient(180deg, rgba(248,250,252,0), rgba(248,250,252,1) 24%);
    border-top: 1px solid #e5e7eb;
  }
  .sticky-bar { max-width:760px; margin:0 auto; display:flex; gap:8px; }
  .flex-1 { flex:1; }

  .summary { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; }
  .summary .box { background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center; }
  .summary .t { font-size:12px; color:#666; }
  .summary .v { font-size:18px; font-weight:800; margin-top:4px; }

  .hole-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; gap:12px; }
  .hole-title { font-size:16px; font-weight:800; }
  .hole-par { display:flex; align-items:center; gap:8px; }
  .shot-item { display:grid; grid-template-columns:1fr; gap:8px; margin-bottom:10px; }
  .shot-row { display:flex; gap:8px; align-items:center; }
  .shot-row input, .shot-row select { flex:1; height:44px; border:1px solid #ddd; border-radius:10px; padding:10px; font-size:16px; }
  `;

  // 상태
  const [date, setDate] = useState(todayStr);
  const [course, setCourse] = useState('아시아나CC');
  const [holes, setHoles] = useState(createInitialHoles);
  const [active, setActive] = useState(0);
  const [savedAt, setSavedAt] = useState(null);

  // 초기 복구
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

  // 즉시 저장
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
    setHoles(init);
    setCourse('아시아나CC');
    setDate(todayStr());
    persist(init, todayStr(), '아시아나CC');
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

  // 렌더
  const activeHole = holes[active];

  return (
    <div className="wrap">
      <style>{styles}</style>

      <h1>⛳ UI 샌드박스(18H)</h1>
      <div className="sub">{savedAt ? `저장됨: ${savedAt.toLocaleTimeString()}` : '입력 시 자동 저장'}</div>

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
                  className={`hole-pill ${i === active ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  {h.hole_number}H
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 활성 홀 */}
        <HoleUnit hole={activeHole} onChange={(next) => updateHole(active, next)} />
      </div>

      {/* 하단 고정 네비 */}
      <div className="sticky-bottom">
        <div className="sticky-bar">
          <button className="ui-secondary" onClick={() => setActive(0)}>1H</button>
          <button className="ui-secondary" onClick={() => setActive(8)}>9H</button>
          <button className="ui-secondary" onClick={() => setActive(17)}>18H</button>
          <button className="ui-secondary flex-1" onClick={gotoPrev}>◀ 이전 홀</button>
          <button className="ui-primary flex-1" onClick={gotoNext}>다음 홀 ▶</button>
        </div>
      </div>
    </div>
  );
}
