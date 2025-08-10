import React, { useState, useEffect } from 'react';
import './DateSelector.css';

export default function DateSelector({ onDateChange }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day,   setDay]   = useState(today.getDate());

  // 연/월/일이 바뀔 때마다 YYYY-MM-DD 포맷으로 부모에 알림
  useEffect(() => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onDateChange(`${year}-${mm}-${dd}`);
  }, [year, month, day, onDateChange]);

  return (
    <div className="date-selector">
      <label className="ds-label">날짜</label>
      <div className="ds-selects">
        <select value={year} onChange={e => setYear(+e.target.value)}>
          {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)
            .map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={e => setMonth(+e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => i + 1)
            .map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
        <select value={day} onChange={e => setDay(+e.target.value)}>
          {Array.from(
             { length: new Date(year, month, 0).getDate() },
             (_, i) => i + 1
           ).map(d => <option key={d} value={d}>{d}일</option>)}
        </select>
      </div>
    </div>
  );
}
