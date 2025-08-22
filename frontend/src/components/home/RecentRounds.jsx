import React, { useEffect, useState } from 'react';
import { fetchRecentRounds } from '../../services/roundService';
import './RecentRounds.css';

function formatDate(isoLike) {
  if (!isoLike) return '-';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function RecentRounds({ limit = 5 }) {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecentRounds(limit);
        setRounds(data);
      } catch (e) {
        console.error(e);
        setErr('최근 라운드를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    })();
  }, [limit]);

  if (loading) return <div className="recentRounds__state">불러오는 중…</div>;
  if (err) return <div className="recentRounds__state error">{err}</div>;
  if (!rounds.length) return <div className="recentRounds__state">최근 라운드가 없습니다.</div>;

  return (
    <div className="recentRounds">
      {rounds.map(r => (
        <button
          key={r.id}
          className="recentRounds__card"
          onClick={() => navigate(`/rounds/${r.id}`)}
          type="button"
        >
          <div className="recentRounds__top">
            <div className="recentRounds__date">{formatDate(r.date)}</div>
            <div className="recentRounds__course">{r.course_name}</div>
          </div>
          <div className="recentRounds__main">
            <div className="recentRounds__score">
              <span className="label">총타</span>
              <strong>{r.total_strokes ?? '-'}</strong>
              {typeof r.to_par === 'number' || typeof r.score === 'number' ? (
                <span className={`rel ${((r.to_par ?? r.score) < 18) ? 'good' : ((r.to_par ?? r.score) > 18 ? 'bad' : '')}`}>
                  {(r.to_par ?? r.score) > 90 ? `+${(r.to_par ?? r.score)}` : (r.to_par ?? r.score)}
                </span>
              ) : null}
            </div>
            <div className="recentRounds__sub">
              <span>퍼팅: {r.total_putts ?? '-'}</span>
              <span>FIR: {r.fir_hit_count ?? '-'}/{r.fir_possible ?? 14}</span>
              <span>GIR: {r.gir_hit_count ?? '-'}/{r.gir_possible ?? 18}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
