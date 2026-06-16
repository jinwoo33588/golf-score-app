import { useRounds } from '@/hooks/useRounds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Round } from '@/types';

// 최근 N 라운드 가져오기
function useRecentRounds(limit = 20) {
  return useRounds({ limit, page: 1 });
}

function ScoreTrend({ rounds }: { rounds: Round[] }) {
  const data = [...rounds].reverse().map((r, i) => ({
    name: `R${i + 1}`,
    스코어: r.summary.totalScore,
    파: r.summary.totalPar,
    label: r.date,
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">스코어 추이</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v, n) => [v, n]}
              labelFormatter={(l, payload) => payload?.[0]?.payload?.label ?? l}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="스코어" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="파" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ScoreDistribution({ rounds }: { rounds: Round[] }) {
  const total = rounds.length;
  if (total === 0) return null;

  const sum = rounds.reduce(
    (acc, r) => ({
      eagle:  acc.eagle  + r.summary.birdiesOrBetter,
      par:    acc.par    + r.summary.pars,
      bogey:  acc.bogey  + r.summary.bogeys,
      double: acc.double + r.summary.doubleBogeyOrWorse,
    }),
    { eagle: 0, par: 0, bogey: 0, double: 0 }
  );
  const holeCount = total * 18;

  const data = [
    { name: '버디↑', count: sum.eagle,  pct: ((sum.eagle  / holeCount) * 100).toFixed(1), fill: '#ef4444' },
    { name: '파',    count: sum.par,    pct: ((sum.par    / holeCount) * 100).toFixed(1), fill: '#94a3b8' },
    { name: '보기',  count: sum.bogey,  pct: ((sum.bogey  / holeCount) * 100).toFixed(1), fill: '#60a5fa' },
    { name: '더블↑', count: sum.double, pct: ((sum.double / holeCount) * 100).toFixed(1), fill: '#1d4ed8' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">스코어 분포 (평균)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, _n, p) => [`${v}개 (${p.payload.pct}%)`, '홀 수']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <rect key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RadarStats({ rounds }: { rounds: Round[] }) {
  if (rounds.length === 0) return null;
  const n = rounds.length;

  const avg = (fn: (r: Round) => number) =>
    Math.round((rounds.reduce((s, r) => s + fn(r), 0) / n) * 10) / 10;

  const data = [
    { subject: 'FIR%',  value: avg((r) => r.summary.firRate) },
    { subject: 'GIR%',  value: avg((r) => r.summary.girRate) },
    { subject: '파 세이브', value: avg((r) => (r.summary.pars / 18) * 100) },
    { subject: '버디율',   value: avg((r) => (r.summary.birdiesOrBetter / 18) * 100) },
    { subject: '3퍼트 없음', value: avg((r) => ((18 - r.summary.threePutts) / 18) * 100) },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">라운드 레이더</CardTitle></CardHeader>
      <CardContent className="flex justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
            <Tooltip formatter={(v) => [`${v}%`]} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function PuttTrend({ rounds }: { rounds: Round[] }) {
  const data = [...rounds].reverse().map((r, i) => ({
    name: `R${i + 1}`,
    퍼트: r.summary.totalPutts,
    label: r.date,
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">퍼트 추이</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
            <Tooltip labelFormatter={(l, p) => p?.[0]?.payload?.label ?? l} />
            <Line type="monotone" dataKey="퍼트" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function StatsPage() {
  const { data, isLoading } = useRecentRounds(20);
  const rounds = data?.rounds ?? [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const n = rounds.length;
  const avgScore = n ? (rounds.reduce((s, r) => s + r.summary.totalScore, 0) / n).toFixed(1) : '-';
  const bestScore = n ? Math.min(...rounds.map((r) => r.summary.totalScore)) : '-';
  const avgFir = n ? (rounds.reduce((s, r) => s + r.summary.firRate, 0) / n).toFixed(1) : '-';
  const avgGir = n ? (rounds.reduce((s, r) => s + r.summary.girRate, 0) / n).toFixed(1) : '-';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">통계</h1>

      {n === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            라운드 기록이 없습니다. 라운드를 기록하면 통계를 볼 수 있습니다.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: '라운드 수',   value: n },
              { label: '평균 스코어', value: avgScore },
              { label: '베스트',      value: bestScore },
              { label: '평균 FIR',   value: `${avgFir}%` },
              { label: '평균 GIR',   value: `${avgGir}%` },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-primary mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 차트 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreTrend rounds={rounds} />
            <PuttTrend rounds={rounds} />
            <ScoreDistribution rounds={rounds} />
            <RadarStats rounds={rounds} />
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">최근 {n}라운드 기준</p>
        </>
      )}
    </div>
  );
}
