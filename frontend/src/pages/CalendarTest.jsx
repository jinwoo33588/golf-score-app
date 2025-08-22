import React, { useMemo, useState, useEffect } from 'react';
import './CalendarTest.css';

// ✅ 기존 라운드 페이지에서 쓰던 훅/함수 그대로 사용
import { listRounds, createRound, removeRound, errMsg } from '../hooks/useRoundApi.js';

// ===== utils =====
const pad2 = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const ymStr = (y, m) => `${y}-${pad2(m + 1)}`;
const firstDayOfMonth = (y, m) => new Date(y, m, 1);

function buildMonthCells(year, month) {
  const first = firstDayOfMonth(year, month);
  const start = new Date(first);
  // 월요일 시작(일:0 → 6 보정)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ===== 오버레이(사이드 시트) =====
function InfoOverlay({ open, dateStr, items, onClose, onAdd, onRemove }) {
  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`cal-overlay ${open ? 'show' : ''}`} aria-hidden={!open}>
      <div className="cal-backdrop" onClick={onClose} />
      <aside className="cal-sheet" role="dialog" aria-modal="true" aria-label="라운드 정보">
        <div className="sheet-head">
          <h4>{dateStr}</h4>
          <button className="sheet-close" onClick={onClose} aria-label="close">×</button>
        </div>

        {items.length === 0 ? (
          <div className="sheet-empty">이 날짜에는 라운드가 없습니다.</div>
        ) : (
          <ul className="sheet-list">
            {items.map(ev => (
              <li key={ev.id} className="sheet-item">
                <div className="bullet">•</div>
                <div className="content">
                  <div className="title">{ev.title}</div>
                  <div className="meta">
                    {ev.tee_time || '--:--'}{ev.status ? ` · ${ev.status}` : ''}
                  </div>
                </div>
                <button className="x" onClick={() => onRemove(ev.id)} aria-label="remove">×</button>
              </li>
            ))}
          </ul>
        )}

        <div className="sheet-actions">
          <button className="primary" onClick={() => onAdd(dateStr)}>＋ 이 날짜에 추가</button>
        </div>
      </aside>
    </div>
  );
}

// ===== main component =====
export default function CalendarTest() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // DB에서 가져온 전체 라운드(캐시)
  const [allRounds, setAllRounds] = useState([]);
  // 현재 달에 표시할 이벤트
  const [events, setEvents] = useState([]);

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 월별 메모 (localStorage에 YYYY-MM 키로 저장)
  const LS_MEMOS = 'calendar_test_memos_v1';
  const loadMemosMap = () => { try { return JSON.parse(localStorage.getItem(LS_MEMOS)) || {}; } catch { return {}; } };
  const saveMemosMap = (m) => localStorage.setItem(LS_MEMOS, JSON.stringify(m));
  const [memos, setMemos] = useState(loadMemosMap);

  const monthLabel = ymStr(year, month);
  const memoForMonth = memos[monthLabel] || '';

  // 오버레이 패널 상태
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));

  // 셀/라벨
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const todayStr = toDateStr(today);

  // ===== DB 로드 =====
  // 1) 최초 마운트 시 라운드 전체(또는 충분한 범위) 1회 로드
  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null);
    // listRounds 훅 시그니처에 파라미터가 필요 없다는 가정.
    // (limit/offset 옵션이 있다면 필요한 만큼 넣어도 됨)
    listRounds()
      .then(rows => {
        if (!mounted) return;
        // 캘린더에서 쓰기 위한 표준화
        const normalized = rows.map(r => ({
          id: r.id,
          date: r.date,                                // 'YYYY-MM-DD'
          title: r.course_name || r.title || '라운드',
          tee_time: r.tee_time ?? null,
          status: r.status || null,
        }));
        setAllRounds(normalized);
      })
      .catch(e => setError(errMsg ? errMsg(e) : (e.message || 'fetch error')))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  // 2) 현재 달 필터링
  useEffect(() => {
    const ym = ymStr(year, month);
    const monthEvents = allRounds.filter(e => e.date && e.date.startsWith(ym));
    setEvents(monthEvents);
  }, [year, month, allRounds]);

  // 날짜별 그룹
  const byDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const selectedList = useMemo(() => {
    const list = allRounds.filter(e => e.date === selectedDate);
    return list.slice().sort((a,b) => (a.tee_time || '').localeCompare(b.tee_time || ''));
  }, [allRounds, selectedDate]);

  // 월 이동
  const goPrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth()); setPanelOpen(false);
  };
  const goNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth()); setPanelOpen(false);
  };

  // 메모 변경
  const onChangeMemo = (v) => {
    setMemos(prev => {
      const next = { ...prev, [monthLabel]: v };
      saveMemosMap(next);
      return next;
    });
  };

  // 날짜 클릭 → 오버레이 열기
  const onDayClick = (dateStr) => { setSelectedDate(dateStr); setPanelOpen(true); };

  // 추가/삭제
  const addQuick = async (dateStr) => {
    const title = window.prompt('라운드 제목(코스명)을 입력하세요');
    if (!title) return;

    // 낙관적 추가 (바로 보이게)
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, date: dateStr, title: title.trim(), tee_time: null, status: 'draft' };
    setAllRounds(prev => [...prev, optimistic]);
    setSelectedDate(dateStr);
    setPanelOpen(true);

    try {
      const created = await createRound({
        date: dateStr,
        course_name: title.trim(),
        tee_time: null,
        notes: null,
        status: 'draft', // 미래/예정은 draft
      });
      // createRound가 생성 객체를 반환한다고 가정
      const createdNormalized = {
        id: created.id ?? created.round?.id ?? Date.now(),
        date: created.date,
        title: created.course_name || title.trim(),
        tee_time: created.tee_time ?? null,
        status: created.status || 'draft',
      };
      setAllRounds(prev => prev.map(e => e.id === tempId ? createdNormalized : e));
    } catch (e) {
      setAllRounds(prev => prev.filter(e => e.id !== tempId)); // 롤백
      alert('라운드 생성 실패: ' + (errMsg ? errMsg(e) : (e.message || '')));
    }
  };

  const removeEvent = async (id) => {
    // 낙관적 제거
    const prev = allRounds;
    setAllRounds(prev.filter(e => e.id !== id));
    try {
      await removeRound(id);
    } catch (e) {
      // 실패 시 복구
      setAllRounds(prev);
      alert('삭제 실패: ' + (errMsg ? errMsg(e) : (e.message || '')));
    }
  };

  return (
    <div className="cal-root">
      <div className="cal-layout">
        {/* 메모 */}
        <aside className="cal-memo">
          <div className="memo-head">
            <h3>{monthLabel} 메모</h3>
            <span className="sub">월별 저장</span>
          </div>
          <textarea
            value={memoForMonth}
            onChange={(e) => onChangeMemo(e.target.value)}
            placeholder="이번 달 목표/메모를 적어두세요. (자동 저장)"
          />
        </aside>

        {/* 달력 */}
        <section className="cal-main">
          <div className="cal-header">
            <button onClick={goPrevMonth} aria-label="prev month">‹</button>
            <strong>{monthLabel}</strong>
            <button onClick={goNextMonth} aria-label="next month">›</button>
          </div>

          {loading && <div style={{opacity:.6, fontSize:12}}>불러오는 중…</div>}
          {error && <div style={{color:'#ef4444', fontSize:12}}>오류: {error}</div>}

          <div className="cal-grid">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w) => (
              <div key={w} className="cal-weekhead">{w}</div>
            ))}

            {cells.map((d, i) => {
              const dateStr = toDateStr(d);
              const inMonth = d.getMonth() === month;
              const isToday = dateStr === todayStr;
              const list = byDate[dateStr] || [];

              return (
                <div
                  key={i}
                  className={`cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}`}
                  onClick={() => onDayClick(dateStr)}
                >
                  <div className="cal-cell-head">
                    <span className="day">{d.getDate()}</span>
                    <button
                      className="add"
                      onClick={(e) => { e.stopPropagation(); addQuick(dateStr); }}
                      aria-label="add on date"
                    >＋</button>
                  </div>

                  <div className="cal-events" onClick={(e) => e.stopPropagation()}>
                    {list.map((ev) => (
                      <div key={ev.id} className="cal-event">
                        <span className="ttl">
                        {ev.title}
                        {ev.status === 'draft' ? ' (예정)' : ''}
                        </span>
                        <button className="del" onClick={() => removeEvent(ev.id)} aria-label="remove">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 오른쪽 오버레이 패널(날짜 상세) */}
      <InfoOverlay
        open={panelOpen}
        dateStr={selectedDate}
        items={selectedList}
        onClose={() => setPanelOpen(false)}
        onAdd={addQuick}
        onRemove={removeEvent}
      />
    </div>
  );
}
