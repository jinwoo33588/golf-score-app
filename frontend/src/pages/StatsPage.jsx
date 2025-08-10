// src/pages/StatsPage.jsx
import React from 'react';
import useStats from '../hooks/useStats';
import StatBox from '../components/StatBox';
import * as Recharts from 'recharts';
import './StatsPage.css';

export default function StatsPage() {
  const { summary, byCourse, trend, loading, error } = useStats();

  if (loading) return <div className="page">로딩 중...</div>;
  if (error)   return <div className="page error">불러오기 실패</div>;

  const trendData   = Array.isArray(trend) ? trend : [];
  const byCourseData = Array.isArray(byCourse) ? byCourse : [];

  const pct = (v) => (v == null ? '-' : `${v}%`);

  return (
    <div className="stats-page">
      <h1>📊 나의 골프 통계</h1>

      {/* 요약 카드 */}
      <div className="stat-grid">
        <StatBox label="평균 퍼팅" value={summary?.avg_putts ?? '-'} />
        <StatBox label="FIR"       value={pct(summary?.fir_pct)} />
        <StatBox label="GIR"       value={pct(summary?.gir_pct)} />
        <StatBox label="평균 To-Par" value={summary?.avg_to_par ?? '-'} />
        <StatBox label="총 라운드" value={summary?.rounds ?? 0} />
        <StatBox label="총 홀"     value={summary?.holes ?? 0} />
      </div>

      {/* 트렌드 라인 차트: 날짜별 To-Par */}
      <section>
        <h2>📈 라운드 추이 (To-Par)</h2>
        <div className="chart">
          {trendData.length === 0 ? (
            <div className="empty">데이터가 아직 없습니다.</div>
          ) : (
            <Recharts.ResponsiveContainer width="100%" height={300}>
              <Recharts.LineChart data={trendData}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="date" />
                <Recharts.YAxis />
                <Recharts.Tooltip />
                <Recharts.Line type="monotone" dataKey="to_par" name="To-Par" />
              </Recharts.LineChart>
            </Recharts.ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 코스별 바 차트: 평균 To-Par / 평균 퍼팅 */}
      <section>
        <h2>🏌️ 코스별 성과</h2>
        <div className="chart">
          {byCourseData.length === 0 ? (
            <div className="empty">코스별 통계가 없습니다.</div>
          ) : (
            <Recharts.ResponsiveContainer width="100%" height={320}>
              <Recharts.BarChart data={byCourseData}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="course" />
                <Recharts.YAxis />
                <Recharts.Tooltip />
                <Recharts.Legend />
                <Recharts.Bar dataKey="avg_to_par" name="평균 To-Par" />
                <Recharts.Bar dataKey="avg_putts"  name="평균 퍼팅" />
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
