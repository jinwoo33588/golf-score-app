import React from 'react';
import { useStatsSummary } from '../../hooks/useStatsSummary';
import './StatsSummary.css';

const fmt = (v) => (v == null ? '-' : v);
const pct = (v) => (v == null ? '-' : `${v}%`);

export default function StatsSummary() {
  const { data, loading, err } = useStatsSummary({ status: 'final' });

  if (loading) return <div className="stats__state">불러오는 중…</div>;
  if (err) return <div className="stats__state error">{err.message ?? String(err)}</div>;
  if (!data) return null;

  return (
    <section className="section section--stats">
      <header className="sectionHead">
        
      </header>
  
    <div className="statsSummary">
          <div className="statsCard"><div className="statsLabel">총 라운드 수</div><div className="statsValue">{fmt(data.rounds_count)}</div></div>
          <div className="statsCard"><div className="statsLabel">평균 타수</div><div className="statsValue">{fmt(data.strokes_avg)}</div></div>
          <div className="statsCard"><div className="statsLabel">평균 퍼팅</div><div className="statsValue">{fmt(data.putts_avg)}</div></div>
          {/* <div className="statsCard"><div className="statsLabel">평균 스코어(파대비)</div><div className="statsValue">{fmt(data.avgScore)}</div></div> */}
          <div className="statsCard"><div className="statsLabel">FIR</div><div className="statsValue">{pct(data.fir_pct)}</div></div>
          <div className="statsCard"><div className="statsLabel">GIR</div><div className="statsValue">{pct(data.gir_pct)}</div></div>
        </div>
    </section>
  );
}

