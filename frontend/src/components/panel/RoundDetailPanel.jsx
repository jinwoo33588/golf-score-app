import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoundDetail from '../../hooks/useRoundDetail';
import * as Recharts from 'recharts';
import './RoundDetailPanel.css';

export default function RoundDetailPanel({ roundId, onEdit, onClose }) {
  const navigate = useNavigate();
  const { round, loading, error } = useRoundDetail(roundId);

  const holes = round?.holes ?? [];

  const totals = useMemo(() => {
    let par = 0, score = 0, putts = 0, firHit = 0, firCnt = 0, girHit = 0, girCnt = 0;
    holes.forEach(h => {
      if (h.par != null) par += Number(h.par);
      if (h.score != null) score += Number(h.score);
      if (h.putts != null) putts += Number(h.putts);
      if (h.par >= 4 && h.fw_hit != null) { firCnt++; if (h.fw_hit) firHit++; }
      if (h.gir != null) { girCnt++; if (h.gir) girHit++; }
    });
    return {
      par, score, putts,
      toPar: (score && par) ? (score - par) : null,
      firPct: firCnt ? Math.round((firHit / firCnt) * 1000)/10 : null,
      girPct: girCnt ? Math.round((girHit / girCnt) * 1000)/10 : null
    };
  }, [holes]);

  const toParSeries = useMemo(() => {
    return holes.map(h => ({
      hole: h.hole_number,
      toPar: (h.score != null && h.par != null) ? (h.score - h.par) : 0
    }));
  }, [holes]);

  if (loading) return <div className="detail-panel">로딩 중...</div>;
  if (error)   return <div className="detail-panel error">불러오기 실패</div>;
  if (!round)  return <div className="detail-panel">데이터 없음</div>;

  return (
    <div className="detail-panel">
      {onClose && (
        <button className="close-btn" aria-label="닫기" onClick={onClose}>×</button>
      )}

      <div className="head">
        <div>
          <h2 className="course">{round.course_name || round.course}</h2>
          <div className="sub">{(round.date || '').slice(0,10)}</div>
        </div>
        <div className="head-actions">
          <button onClick={onEdit}>수정</button>
          <button className="primary" onClick={() => navigate(`/rounds/${roundId}`)}>상세보기</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="label">총 스코어</div><div className="value">{totals.score ?? '-'}</div></div>
        <div className="stat"><div className="label">To-Par</div><div className="value">{totals.toPar ?? '-'}</div></div>
        <div className="stat"><div className="label">퍼팅 합</div><div className="value">{totals.putts ?? '-'}</div></div>
        <div className="stat"><div className="label">FIR</div><div className="value">{totals.firPct != null ? `${totals.firPct}%` : '-'}</div></div>
        <div className="stat"><div className="label">GIR</div><div className="value">{totals.girPct != null ? `${totals.girPct}%` : '-'}</div></div>
      </div>

      <div className="chart">
        <h3>홀별 To-Par</h3>
        <div className="chart-box">
          <Recharts.ResponsiveContainer width="100%" height={220}>
            <Recharts.BarChart data={toParSeries}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="hole" />
              <Recharts.YAxis />
              <Recharts.Tooltip />
              <Recharts.Bar dataKey="toPar" name="To-Par" />
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
