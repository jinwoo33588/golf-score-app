// src/pages/StatsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import './StatsPage.css';

import { buildAnalytics } from '../hooks/useAnalytics.js';
import StatsFilters from '../components/stats/StatsFilters.jsx';
import MetricTile from '../components/ui/MetricTile.jsx';
import SimpleBar from '../components/stats/SimpleBar.jsx';

export default function StatsPage() {
  const [filters, setFilters] = useState({
    status: 'final',
    from: null,
    to: null,
    q: '',
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [summary, setSummary] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const { summary } = await buildAnalytics(filters);
      setSummary(summary);
      setErr(null);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || e?.message || 'load error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // 필터 변경 시 즉시 로드 (원하면 버튼 눌러서 적용도 가능)
  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [filters.status, filters.from, filters.to, filters.q]);

  const trendData = useMemo(() => {
    if (!summary?.trend?.length) return [];
    return summary.trend.map(t => ({ label: t.month.slice(5), value: t.avg_to_par }));
  }, [summary]);

  const courseData = useMemo(() => {
    if (!summary?.courses?.length) return [];
    return summary.courses.map(c => ({ label: c.course.slice(0,8), value: c.avg_to_par }));
  }, [summary]);

  return (
    <div className="container">
      <h1 className="sp__h1">통계 대시보드</h1>
      <StatsFilters value={filters} onChange={(p)=>setFilters(prev=>({ ...prev, ...p }))} />

      {loading && <div className="sp__box">로딩 중…</div>}
      {err && <div className="sp__err">{err}</div>}

      {!loading && summary && (
        <>
          {/* 요약 타일 */}
          <section className="sp__grid sp__grid--5">
            <MetricTile label="Rounds" value={summary.rounds} accent="blue" />
            <MetricTile label="Holes" value={summary.holes} accent="blue" />
            <MetricTile label="to-par total" value={summary.to_par_total} mode="par" accent="amber" />
            <MetricTile label="Putts avg" value={summary.putts_avg} accent="green" />
            <MetricTile label="Penalties" value={summary.penalties_total} accent="red" />
          </section>

          {/* 비율 지표 */}
          <section className="sp__grid sp__grid--4">
            <MetricTile label="FIR" value={summary.fir_pct} mode="pct" accent="blue" hint="(par3 제외)" />
            <MetricTile label="GIR" value={summary.gir_pct} mode="pct" accent="green" />
            <MetricTile label="3-putt rate" value={summary.three_putt_rate} mode="pct" accent="amber" />
            <MetricTile label="Double+ rate" value={summary.double_or_worse_rate} mode="pct" accent="red" />
          </section>

          {/* 월별 추이 */}
          <section className="sp__card">
            <div className="sp__cardtitle">월별 평균 to-par</div>
            {trendData.length ? <SimpleBar data={trendData} /> : <div className="sp__muted">데이터 없음</div>}
          </section>

          {/* 코스별 스플릿 */}
          <section className="sp__card">
            <div className="sp__cardtitle">코스별 평균 to-par (상위 8)</div>
            {courseData.length ? <SimpleBar data={courseData} /> : <div className="sp__muted">데이터 없음</div>}
          </section>

          {/* 분포 */}
          <section className="sp__card">
            <div className="sp__cardtitle">스코어 분포(총합)</div>
            <div className="sp__chips">
              {[
                ['Eagle(≤-2)', summary.dist?.eagle],
                ['Birdie(-1)', summary.dist?.birdie],
                ['Par(0)', summary.dist?.par],
                ['Bogey(+1)', summary.dist?.bogey],
                ['Double+(≥+2)', summary.dist?.double_plus],
              ].map(([label, v]) => (
                <span key={label} className="sp__pill">
                  <span className="sp__pill-l">{label}</span>
                  <span className="sp__pill-v">{v ?? '-'}</span>
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
