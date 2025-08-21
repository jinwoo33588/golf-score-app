import { useState } from 'react';
import './RoundStatsPanel.css';
import MetricTile from '../ui/MetricTile.jsx';
import Button from '../ui/Button.jsx';

/**
 * RoundStatsPanel
 *  - variant: 'collapse' | 'inline'
 *  - defaultOpen: collapse 기본 열림 여부
 *  기본(요약): strokes, putts, FIR, GIR, penalties
 *  세부(그룹): 스코어, 퍼팅, 리스크, 분포
 */
export default function RoundStatsPanel({ stats, variant = 'collapse', defaultOpen = false }) {
  if (!stats) return <div className="rstat rstat--loading">통계 로딩...</div>;

  const basic = (
    <div className="rstat__grid rstat__grid--basic" aria-label="기본 정보">
      <MetricTile label="strokes"   value={stats.strokes_total} accent="blue" />
      <MetricTile label="putts"     value={stats.putts_total}   accent="green" />
      <MetricTile label="FIR"       value={stats.fir_pct}       mode="pct" accent="blue" />
      <MetricTile label="GIR"       value={stats.gir_pct}       mode="pct" accent="green" />
      <MetricTile label="penalties" value={stats.penalties_total} accent="red" />
    </div>
  );

  const details = (
    <div className="rstat__details">
      <GroupCard title="스코어">
        <div className="rstat__grid rstat__grid--details">
          <MetricTile label="to-par" value={stats.to_par} mode="par" accent="amber" />
          <MetricTile label="out"    value={stats.out_total}     accent="gray" />
          <MetricTile label="in"     value={stats.in_total}      accent="gray" />
          <MetricTile label="par3 avg" value={stats.par3_avg}    accent="gray" size="sm" />
          <MetricTile label="par4 avg" value={stats.par4_avg}    accent="gray" size="sm" />
          <MetricTile label="par5 avg" value={stats.par5_avg}    accent="gray" size="sm" />
        </div>
      </GroupCard>

      <GroupCard title="퍼팅">
        <div className="rstat__grid rstat__grid--details">
          <MetricTile label="3-putt" value={stats.three_putt_rate} mode="pct" accent="amber"
            hint="3퍼트 발생 비율" />
        </div>
      </GroupCard>

      <GroupCard title="리스크">
        <div className="rstat__grid rstat__grid--details">
          <MetricTile label="dbl+ rate" value={stats.double_or_worse_rate} mode="pct" accent="red"
            hint="더블 이상 비율" />
          <MetricTile label="penalties" value={stats.penalties_total} accent="red" size="sm" />
        </div>
      </GroupCard>

      <GroupCard title="분포">
        <DistRow dist={stats.dist} />
      </GroupCard>
    </div>
  );

  if (variant === 'inline') {
    return (
      <section className="rstat" data-variant="inline">
        {basic}
        {details}
      </section>
    );
  }

  return <CollapsibleStats basic={basic} details={details} defaultOpen={defaultOpen} />;
}

/* --------------------------- 하위 컴포넌트 --------------------------- */

function CollapsibleStats({ basic, details, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="rstat" data-variant="collapse">
      {basic}
      <div className="rstat__collapse-bar">
        <span className="rstat__collapse-title">세부 정보</span>
        <Button size="sm" variant="ghost" onClick={() => setOpen(v => !v)}>
          {open ? '접기 ▲' : '펼치기 ▼'}
        </Button>
      </div>
      {open && details}
    </section>
  );
}

function GroupCard({ title, children }) {
  return (
    <section className="gcard">
      <div className="gcard__title">{title}</div>
      <div className="gcard__body">{children}</div>
    </section>
  );
}

function DistRow({ dist }) {
  const items = [
    { key: 'eagle',       label: 'Eagle(≤-2)',  val: dist?.eagle ?? null,       tone: 'tone-eagle' },
    { key: 'birdie',      label: 'Birdie(-1)',  val: dist?.birdie ?? null,      tone: 'tone-birdie' },
    { key: 'par',         label: 'Par(0)',      val: dist?.par ?? null,         tone: 'tone-par' },
    { key: 'bogey',       label: 'Bogey(+1)',   val: dist?.bogey ?? null,       tone: 'tone-bogey' },
    { key: 'double_plus', label: 'Double+(≥+2)',val: dist?.double_plus ?? null, tone: 'tone-double' },
  ];
  return (
    <div className="rstat__dist" aria-label="스코어 분포">
      {items.map(it => (
        <span key={it.key} className={`rstat__pill ${it.tone}`}>
          <span className="rstat__pill-label">{it.label}</span>
          <span className="rstat__pill-val">{it.val == null ? '-' : it.val}</span>
        </span>
      ))}
    </div>
  );
}
