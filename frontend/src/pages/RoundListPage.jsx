// src/pages/RoundListPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRounds from '../hooks/useRounds';
import './RoundListPage.css';

export default function RoundListPage() {
  const navigate = useNavigate();
  const { rounds, loading, error } = useRounds(); // 이미 구현된 훅
  const [query, setQuery] = useState('');
  const [sort, setSort]   = useState('date_desc'); // date_desc | date_asc | course

  const filtered = useMemo(() => {
    if (!rounds) return [];
    let arr = [...rounds];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(r =>
        r.course.toLowerCase().includes(q) ||
        (r.date && r.date.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case 'date_asc':
        arr.sort((a,b) => (a.date > b.date ? 1 : -1)); break;
      case 'course':
        arr.sort((a,b) => a.course.localeCompare(b.course)); break;
      default:
        arr.sort((a,b) => (a.date < b.date ? 1 : -1)); // desc
    }
    return arr;
  }, [rounds, query, sort]);

  if (loading) return <div className="page">로딩 중...</div>;
  if (error)   return <div className="page error">불러오기 실패</div>;

  return (
    <div className="round-list-page">
      <div className="toolbar">
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="코스/날짜 검색"
        />
        <select value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="date_desc">날짜 최신순</option>
          <option value="date_asc">날짜 오래된순</option>
          <option value="course">코스명</option>
        </select>
        <button className="primary" onClick={()=>navigate('/rounds/new')}>
          + 새 라운드
        </button>
      </div>

      <div className="grid">
        {filtered.map(r => (
          <div key={r.id} className="round-card" onClick={()=>navigate(`/rounds/${r.id}`)}>
            <div className="top">
              <div className="course">{r.course}</div>
              <div className="date">{r.date?.slice(0,10)}</div>
            </div>
            <div className="bottom">
              <div className="label">스코어</div>
              <div className="value">{r.totalScore ?? '-'}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty">조건에 맞는 라운드가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
