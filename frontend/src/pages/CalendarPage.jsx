import React, { useMemo, useState } from 'react';
import './CalendarPage.css';

const pad2 = (n) => String(n).padStart(2, '0');
const firstDayOfMonth = (y, m) => new Date(y, m, 1);
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

function buildCells(year, month) {
  const first = firstDayOfMonth(year, month);
  const start = new Date(first);
  // 월요일 시작 보정
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]); // {id,date,title}[]
  const [adding, setAdding] = useState(null); // { dateStr }
  const [title, setTitle] = useState('');

  const cells = useMemo(() => buildCells(year, month), [year, month]);
  const todayStr = toDateStr(today);

  const monthLabel = `${year}-${pad2(month + 1)}`;

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
  };

  const openAdd = (dateStr) => { setAdding({ dateStr }); setTitle(''); };
  const closeAdd = () => setAdding(null);
  const submitAdd = (e) => {
    e.preventDefault();
    setEvents([...events, { id: Date.now(), date: adding.dateStr, title }]);
    closeAdd();
  };

  const byDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  return (
    <div className="calendar-page">
      <div className="cal-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>{monthLabel}</h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <div className="cal-grid">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w) => (
          <div key={w} className="cal-weekhead">{w}</div>
        ))}

        {cells.map((d, i) => {
          const dateStr = toDateStr(d);
          const inMonth = d.getMonth() === month;
          const isToday = dateStr === todayStr;
          const dayEvents = byDate[dateStr] || [];

          return (
            <div key={i} className={`cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}`}>
              <div className="cal-cell-head">
                <span className="day">{d.getDate()}</span>
                <button className="add" onClick={() => openAdd(dateStr)}>＋</button>
              </div>
              <div className="cal-events">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="cal-event">{ev.title}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="modal">
          <div className="modal-body">
            <h3>{adding.dateStr} 일정 추가</h3>
            <form onSubmit={submitAdd} className="modal-form">
              <input
                placeholder="라운드 이름"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={closeAdd}>취소</button>
                <button type="submit">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
