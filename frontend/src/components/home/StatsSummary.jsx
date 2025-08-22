import React, { useEffect, useState } from 'react';
import { fetchStatsSummary } from '../../services/statsService';
import './StatsSummary.css';

export default function StatsSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchStatsSummary();
        setData(res);
      } catch (e) {
        console.error(e);
        setErr('통계 요약을 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="stats__state">불러오는 중…</div>;
  if (err) return <div className="stats__state error">{err}</div>;
  if (!data) return null;

  return (
    <div className="statsSummary">
      <div className="statsCard">
        <div className="statsLabel">평균 스코어</div>
        <div className="statsValue">{data.avgScore}</div>
      </div>
      <div className="statsCard">
        <div className="statsLabel">평균 퍼팅</div>
        <div className="statsValue">{data.avgPutts}</div>
      </div>
      <div className="statsCard">
        <div className="statsLabel">FIR </div>
        <div className="statsValue">
          {data.firPercent}% 
        </div>
      </div>
      <div className="statsCard">
        <div className="statsLabel">GIR</div>
        <div className="statsValue">{data.girPercent}%</div>
      </div>
    </div>
  );
}
