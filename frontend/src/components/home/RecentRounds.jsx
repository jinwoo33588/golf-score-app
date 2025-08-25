import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
const fmtRel = (n) => (n > 0 ? `+${n}` : `${n}`);

export default function RecentRounds({ limit = 5 }) {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecentRounds(limit);
        setRounds(Array.isArray(data) ? data : []);
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
      {rounds.map((r) => {
        const totalStrokes = r.total_strokes ?? null;
        const totalScore = (typeof r.total_score === 'number') ? r.total_score
                          : (typeof r.to_par === 'number') ? r.to_par
                          : (typeof r.score === 'number') ? r.score
                          : null;

        // FIR/GIR 표시 우선순위: 퍼센트 → (hit/possible) → '-'
        const firPercent = (typeof r.fir_pct === 'number')
          ? `${r.fir_pct}%`
          : (r.fir_possible ? `${r.fir_hit_count ?? 0}/${r.fir_possible}` : '-');
        const girPercent = (typeof r.gir_pct === 'number')
          ? `${r.gir_pct}%`
          : (r.gir_possible ? `${r.gir_hit_count ?? 0}/${r.gir_possible}` : '-');

        return (
          <button
  key={r.id}
  className="recentRounds__card"
  onClick={() => navigate(`/rounds/${r.id}`)}
  type="button"
>
  {/* 코스명 */}
  <div className="rr-course">{r.course_name}</div>

  {/* 날짜 */}
  <div className="rr-date">{formatDate(r.date)}</div>

  {/* 총타 + 상대스코어 */}
  <div className="rr-total">
    <strong className="value">{totalStrokes ?? '-'}</strong>
    {typeof totalScore === 'number' && (
      <div className={`rr-rel ${totalScore < 0 ? 'good' : (totalScore > 0 ? 'bad' : '')}`}>
        {fmtRel(totalScore)}
      </div>
    )}
  </div>

  {/* Hover Panel */}
  <div className="rr-hoverPanel" aria-hidden="true">
    <div className="rr-stat"><span className="label">퍼팅</span><strong className="value">{r.total_putts ?? '-'}</strong></div>
    <div className="rr-stat"><span className="label">FIR</span><strong className="value">{firPercent}</strong></div>
    <div className="rr-stat"><span className="label">GIR</span><strong className="value">{girPercent}</strong></div>
  </div>
</button>


        );
      })}
    </div>
  );
}
