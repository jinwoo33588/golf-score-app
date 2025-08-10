import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';

const LS_KEY = 'uiSandbox18_v1'; // ✅ 네가 쓰던 v1 방식 그대로

// ---------- Util ----------
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

// ---------- Data ----------
function createInitialHoles() {
  return Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: 4,
    score: 0, putts: 2, penalties: 0,
    fir: null, gir: null,
    notes: '', shots: []
  }));
}

const COURSE_PRESETS = {
  '아시아나CC': [4,5,4,3,4,3,5,3,4, 4,4,5,3,4,4,5,3,4],
};

// ---------- iOS 단일탭: 터치 1번 = 1회 반응 ----------
function useSingleTap(onTap) {
  const touchedRef = useRef(false);
  const onTouchStart = useCallback(() => { touchedRef.current = true; }, []);
  const onTouchEnd = useCallback((e) => {
    e.preventDefault(); // iOS에서 click 중복 방지
    onTap && onTap();
    setTimeout(() => { touchedRef.current = false; }, 80);
  }, [onTap]);
  const onClick = useCallback((e) => {
    if (touchedRef.current) { e.preventDefault(); return; }
    onTap && onTap();
  }, [onTap]);
  return { onTouchStart, onTouchEnd, onClick };
}
function TapButton({ className='', onTap, children, ...rest }) {
  const handlers = useSingleTap(onTap);
  return <button type="button" className={className} {...handlers} {...rest}>{children}</button>;
}

// ---------- Shot Editor (compact) ----------
function ShotEditor({ shot, onChange, onRemove }) {
  return (
    <div className="ui-card shot-item">
      <div className="shot-row">
        <input placeholder="클럽" value={shot.club||''} onChange={e=>onChange('club',e.target.value)} />
        <input placeholder="상태(페어웨이/러프/벙커)" value={shot.condition||''} onChange={e=>onChange('condition',e.target.value)} />
      </div>
      <div className="shot-row">
        <input placeholder="남은거리(m)" inputMode="numeric" value={shot.remaining_dist??''} onChange={e=>onChange('remaining_dist', e.target.value===''?'':Number(e.target.value))} />
        <input placeholder="실제거리(m)" inputMode="numeric" value={shot.actual_dist??''} onChange={e=>onChange('actual_dist', e.target.value===''?'':Number(e.target.value))} />
      </div>
      <div className="shot-row">
        <input placeholder="결과(그린우/해저드 등)" value={shot.result||''} onChange={e=>onChange('result',e.target.value)} />
        <input placeholder="메모" value={shot.notes||''} onChange={e=>onChange('notes',e.target.value)} />
      </div>
      <div className="ui-actions">
        <TapButton className="ui-danger" onTap={onRemove}>샷 삭제</TapButton>
      </div>
    </div>
  );
}

// ---------- Tri-state Toggle ----------
function TriToggle({ label, value, onChange }) {
  return (
    <div className="ui-row">
      <div className="ui-label">{label}</div>
      <div className="ui-toggle">
        <TapButton className={`ui-pill ${value===true?'active':''}`} onTap={()=>onChange(true)}>YES</TapButton>
        <TapButton className={`ui-pill ${value===false?'active':''}`} onTap={()=>onChange(false)}>NO</TapButton>
        <TapButton className={`ui-pill ${value===null?'active':''}`} onTap={()=>onChange(null)}>•</TapButton>
      </div>
    </div>
  );
}

// ---------- Hole Card (compact) ----------
function HoleUnit({ hole, onChange }) {
  const h = hole || {};
  const set = (k,v)=>onChange({ ...h, [k]: v });

  const [openNotes, setOpenNotes] = useState(false);
  const [openShots, setOpenShots] = useState(false);

  const addShot = () => set('shots',[...(h.shots||[]),{club:'',condition:'',remaining_dist:'',actual_dist:'',result:'',notes:''}]);
  const updateShot = (i,k,v)=>{ const arr=[...(h.shots||[])]; arr[i]={...arr[i],[k]:v}; set('shots',arr); };
  const removeShot = (i)=>{ const arr=[...(h.shots||[])]; arr.splice(i,1); set('shots',arr); };

  return (
    <div className="ui-card">
      <div className="hole-header sticky-top">
        <div className="hole-title">🕳️ {h.hole_number}H</div>
        <div className="hole-par">
          <span>Par</span>
          <input style={{maxWidth:70}} inputMode="numeric" value={h.par??4} onChange={e=>set('par', e.target.value===''?'':Number(e.target.value))}/>
        </div>
      </div>

      <div className="kv">
        <div className="kv-item"><div className="kv-t">스코어</div><div className="kv-v">{signLabel(h.score??0)}</div></div>
        <div className="kv-item"><div className="kv-t">퍼팅</div><div className="kv-v">{h.putts??0}</div></div>
        <div className="kv-item"><div className="kv-t">FIR</div><div className="kv-v">{h.fir==null?'—':h.fir?'YES':'NO'}</div></div>
        <div className="kv-item"><div className="kv-t">GIR</div><div className="kv-v">{h.gir==null?'—':h.gir?'YES':'NO'}</div></div>
      </div>

      <TriToggle label="FIR" value={h.fir} onChange={(v)=>set('fir',v)} />
      <TriToggle label="GIR" value={h.gir} onChange={(v)=>set('gir',v)} />

      {/* 접힘: 노트 */}
      <div className="collapser">
        <TapButton className="collapse-head" onTap={()=>setOpenNotes(v=>!v)}>노트 {openNotes?'▾':'▸'}</TapButton>
        {openNotes && (
          <div className="collapse-body">
            <textarea className="ui-textarea" placeholder="코스 메모, 바람, 라이 등" value={h.notes||''} onChange={e=>set('notes',e.target.value)} />
          </div>
        )}
      </div>

      {/* 접힘: 샷 */}
      <div className="collapser">
        <TapButton className="collapse-head" onTap={()=>setOpenShots(v=>!v)}>샷 {openShots?'▾':'▸'}</TapButton>
        {openShots && (
          <div className="collapse-body">
            {(h.shots||[]).map((s,i)=>(
              <ShotEditor key={i} shot={s} onChange={(k,v)=>updateShot(i,k,v)} onRemove={()=>removeShot(i)} />
            ))}
            <div className="ui-actions">
              <TapButton className="ui-secondary" onTap={addShot}>샷 추가</TapButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Page (iPhone 14 Pro, 393px, no horizontal scroll) ----------
export default function UISandbox() {
  const styles = `
  :root { --pad:14px; --radius:12px; --safe-bottom: env(safe-area-inset-bottom); }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root { height:100%; }
  html, body { overflow-x:hidden; } /* 좌우 스크롤 방지 */
  body { background:#f5f6fa; font-size:16px; }

  .wrap {
    min-height: 100dvh;
    padding: var(--pad);
    padding-bottom: calc(84px + var(--safe-bottom));
    margin: 0 auto;
    max-width: 393px; /* iPhone 14 Pro 폭에 맞춤 */
  }

  h1 { font-size:18px; font-weight:800; margin: 0 0 4px; }
  .sub { color:#666; font-size:12px; margin-bottom:8px; display:flex; gap:6px; align-items:center; }

  .ui-card { background:#fff; border:1px solid #eee; border-radius: var(--radius); padding: 10px; box-shadow:0 1px 5px rgba(0,0,0,.04); }
  .stack { display:grid; gap:8px; }

  .ui-row { display:flex; align-items:center; justify-content:space-between; margin:8px 0; gap:8px; }
  .ui-label { font-weight:800; font-size:13px; white-space:nowrap; }
  .ui-toggle { display:flex; gap:6px; flex-wrap:wrap; }
  .ui-pill { padding:8px 12px; border-radius:999px; border:1px solid #ddd; background:#fff; font-weight:800; }
  .ui-pill.active { border-color:#0ea5e9; box-shadow:0 0 0 2px rgba(14,165,233,.15); }

  .ui-text { width:100%; height:42px; border:1px solid #ddd; border-radius:10px; padding:8px; font-size:16px; }
  .ui-textarea { width:100%; min-height:68px; border:1px solid #ddd; border-radius:10px; padding:8px; font-size:16px; }

  .ui-actions { display:flex; gap:6px; flex-wrap:wrap; }
  .ui-primary { background:#0ea5e9; color:#fff; border:none; padding:10px 12px; border-radius:10px; font-weight:900; }
  .ui-secondary { background:#f3f4f6; color:#111; border:none; padding:10px 12px; border-radius:10px; font-weight:800; }
  .ui-danger { background:#ef4444; color:#fff; border:none; padding:10px 12px; border-radius:10px; font-weight:900; }

  .top-row { display:grid; gap:8px; grid-template-columns: 1fr; }
  .grid2 { display:grid; gap:8px; grid-template-columns: 1fr 1fr; }

  /* 6×3 홀 그리드 (가로 스크롤 없음) */
  .hole-grid { display:grid; grid-template-columns: repeat(6, 1fr); gap:6px; }
  .hole-pill { padding:6px 0; border:1px solid #ddd; border-radius:999px; background:#fff; font-weight:900; text-align:center; }
  .hole-pill.active { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
  .hole-pill.done { border-color:#16a34a; }

  .sticky-top { position: sticky; top: -4px; background:#fff; z-index: 2; padding-bottom: 4px; margin-bottom: 4px; }
  .hole-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .hole-title { font-size:15px; font-weight:900; }
  .hole-par { display:flex; align-items:center; gap:6px; }
  .hole-par input { height:38px; border:1px solid #ddd; border-radius:10px; padding:8px; font-size:16px; width:70px; }

  /* 핵심 값 */
  .kv { display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin:4px 0 6px; }
  .kv-item { background:#f9fafb; border:1px solid #eee; border-radius:10px; padding:6px; text-align:center; }
  .kv-t { font-size:11px; color:#666; }
  .kv-v { font-size:16px; font-weight:900; margin-top:2px; }

  /* 접힘 섹션 */
  .collapser { margin-top:6px; }
  .collapse-head { width:100%; text-align:left; background:#f3f4f6; border:none; border-radius:10px; padding:8px 10px; font-weight:900; }
  .collapse-body { padding-top:6px; }

  /* 하단 퀵패드: 4열×2행 */
  .quickpad {
    position: fixed; left: 0; right: 0; bottom: 0;
    padding: 8px 10px calc(8px + var(--safe-bottom));
    background: rgba(255,255,255,.96);
    backdrop-filter: saturate(180%) blur(6px);
    border-top: 1px solid #e5e7eb;
  }
  .qp { max-width: 393px; margin:0 auto; display:grid; gap:6px; }
  .qp-row { display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; }
  .qp-big { height:44px; font-size:18px; border-radius:10px; border:1px solid #ddd; background:#fff; font-weight:900; }
  .qp-pill { height:44px; border-radius:999px; border:1px solid #ddd; background:#fff; font-weight:900; }
  .qp-pill.active { border-color:#0ea5e9; box-shadow:0 0 0 2px rgba(14,165,233,.15); }
  .qp-primary { height:44px; border:none; border-radius:10px; background:#0ea5e9; color:#fff; font-weight:900; }
  .qp-ghost { height:44px; border-radius:10px; border:1px dashed #ddd; display:grid; place-items:center; font-weight:800; }

  .summary { display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; }
  .summary .box { background:#fff; border:1px solid #eee; border-radius:10px; padding:8px; text-align:center; }
  .summary .t { font-size:11px; color:#666; }
  .summary .v { font-size:16px; font-weight:900; margin-top:2px; }
  `;

  // ---------- State (v1 방식) ----------
  const [date, setDate] = useState(todayStr);
  const [course, setCourse] = useState('아시아나CC');
  const [holes, setHoles] = useState(createInitialHoles);
  const [active, setActive] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const hasAppliedPresetRef = useRef(false);

  // 초기 복구 (v1)
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

  // 즉시 저장 (v1)
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

  // 아시아나 PAR 자동/수동 적용 (디자인 유지)
  const applyParPreset = useCallback((name) => {
    const arr = COURSE_PRESETS[name];
    if (!arr || arr.length !== 18) return false;
    const next = holes.map((h,i)=>({ ...h, par: Number(arr[i]) }));
    setHoles(next);
    persist(next, date, course);
    setSavedAt(new Date());
    return true;
  }, [holes, persist, date, course]);

  useEffect(() => {
    if (hasAppliedPresetRef.current) return;
    if (course === '아시아나CC') {
      const allDefault = holes.every(h => h.par==null || Number(h.par)===4);
      if (allDefault) {
        if (applyParPreset('아시아나CC')) hasAppliedPresetRef.current = true;
      }
    }
  }, [course, holes, applyParPreset]);

  // Summary
  const summary = useMemo(() => {
    const totalRel = holes.reduce((s,h)=>s+(Number(h.score)||0),0);
    const totalPutts = holes.reduce((s,h)=>s+(Number(h.putts)||0),0);
    const firCount = holes.filter(h=>h.fir===true).length;
    const firValid = holes.filter(h=>h.fir!==null).length;
    const girCount = holes.filter(h=>h.gir===true).length;
    const girValid = holes.filter(h=>h.gir!==null).length;
    const firPct = firValid ? Math.round((firCount/firValid)*100) : null;
    const girPct = girValid ? Math.round((girCount/girValid)*100) : null;
    return { totalRel, totalPutts, firPct, girPct };
  }, [holes]);

  // Actions
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
    try { await navigator.clipboard.writeText(JSON.stringify(payload, null, 2)); alert('JSON 복사 완료!'); }
    catch { alert('복사 실패. 내보내기를 사용하세요.'); }
  };
  const exportJSON = () => {
    const payload = { date, course, holes };
    const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `golf-round-${course}-${date}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const shareJSON = async () => {
    try {
      const payload = { date, course, holes };
      const file = new File([JSON.stringify(payload,null,2)], `golf-round-${course}-${date}.json`, { type:'application/json' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files:[file] })) {
        await navigator.share({ title:'Golf Round', text:`${course} ${date}`, files:[file] });
      } else { exportJSON(); }
    } catch {}
  };

  // Hole change & keypad
  const gotoPrev = () => setActive(a=>Math.max(0,a-1));
  const gotoNext = () => setActive(a=>Math.min(17,a+1));
  const bumpScore = (d) => { const h=holes[active]; updateHole(active,{...h, score: clamp((h.score??0)+d,-5,10)}); };
  const bumpPutts = (d) => { const h=holes[active]; updateHole(active,{...h, putts: clamp((h.putts??0)+d,0,10)}); };
  const cycleFIR = () => { const h=holes[active]; const next=h.fir===null?true:h.fir===true?false:null; updateHole(active,{...h,fir:next}); };
  const cycleGIR = () => { const h=holes[active]; const next=h.gir===null?true:h.gir===true?false:null; updateHole(active,{...h,gir:next}); };

  const activeHole = holes[active];
  const isDone = (h)=> (h.putts??0)>0 || h.fir!=null || h.gir!=null || (h.score??0)!==0;

  return (
    <div className="wrap">
      <style>{styles}</style>

      <h1>⛳ 라운드 입력 (iPhone 14 Pro)</h1>
      <div className="sub">
        <span>{savedAt ? `저장됨 ${savedAt.toLocaleTimeString()}` : '입력 즉시 저장'}</span>
      </div>

      <div className="stack" style={{marginBottom:6}}>
        <div className="ui-card">
          <div className="top-row">
            <div className="grid2">
              <div>
                <div className="ui-label">날짜</div>
                <input type="date" className="ui-text" value={date} onChange={e=>updateDate(e.target.value)} />
              </div>
              <div>
                <div className="ui-label">코스</div>
                <input className="ui-text" value={course} onChange={e=>updateCourse(e.target.value)} placeholder="코스명 입력" />
              </div>
            </div>

            <div className="summary">
              <div className="box"><div className="t">스코어</div><div className="v">{signLabel(summary.totalRel)}</div></div>
              <div className="box"><div className="t">퍼팅 합</div><div className="v">{summary.totalPutts}</div></div>
              <div className="box"><div className="t">FIR</div><div className="v">{summary.firPct==null?'—':`${summary.firPct}%`}</div></div>
              <div className="box"><div className="t">GIR</div><div className="v">{summary.girPct==null?'—':`${summary.girPct}%`}</div></div>
            </div>

            <div className="ui-actions">
              <TapButton className="ui-secondary" onTap={()=>applyParPreset(course)}>코스 파 불러오기</TapButton>
              <TapButton className="ui-primary" onTap={shareJSON}>공유/내보내기</TapButton>
              <TapButton className="ui-secondary" onTap={copyJSON}>JSON 복사</TapButton>
              <TapButton className="ui-danger" onTap={resetAll}>초기화</TapButton>
            </div>
          </div>

          {/* 6×3 전체 홀 그리드 (가로 스크롤 없음) */}
          <div className="ui-card" style={{marginTop:6}}>
            <div className="hole-grid">
              {holes.map((h,i)=>(
                <TapButton
                  key={i}
                  className={`hole-pill ${i===active?'active':''} ${isDone(h)?'done':''}`}
                  onTap={()=>setActive(i)}
                >
                  {h.hole_number}
                </TapButton>
              ))}
            </div>
          </div>
        </div>

        {/* 활성 홀 */}
        <HoleUnit hole={activeHole} onChange={(n)=>updateHole(active, n)} />
      </div>

      {/* 하단 퀵패드: 4열×2행 */}
      <div className="quickpad">
        <div className="qp">
          <div className="qp-row">
            <TapButton className="qp-big" onTap={()=>bumpScore(-1)}>− 스코어</TapButton>
            <TapButton className={`qp-pill ${activeHole.fir?'active':''}`} onTap={cycleFIR}>
              {activeHole.fir===null?'FIR •':activeHole.fir?'FIR ✓':'FIR ✗'}
            </TapButton>
            <TapButton className={`qp-pill ${activeHole.gir?'active':''}`} onTap={cycleGIR}>
              {activeHole.gir===null?'GIR •':activeHole.gir?'GIR ✓':'GIR ✗'}
            </TapButton>
            <TapButton className="qp-big" onTap={()=>bumpScore(+1)}>＋ 스코어</TapButton>
          </div>
          <div className="qp-row">
            <TapButton className="qp-big" onTap={()=>bumpPutts(-1)}>− 퍼팅</TapButton>
            <TapButton className="qp-primary" onTap={gotoPrev}>◀ 이전</TapButton>
            <TapButton className="qp-primary" onTap={gotoNext}>다음 ▶</TapButton>
            <TapButton className="qp-big" onTap={()=>bumpPutts(+1)}>＋ 퍼팅</TapButton>
          </div>
        </div>
      </div>
    </div>
  );
}
