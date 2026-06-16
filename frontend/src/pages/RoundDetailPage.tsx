import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRound, useDeleteRound } from '@/hooks/useRounds';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, scoreClass } from '@/lib/utils';
import { RoundHole } from '@/types';


function HoleRow({ hole }: { hole: RoundHole }) {
  const par = hole.courseHoleSnapshot.par;
  const diff = hole.score - par;
  const diffLabel = diff === 0 ? '0' : `${diff}`;
  return (
    <tr className="border-b hover:bg-muted/20 text-sm">
      <td className="px-3 py-2 text-xs text-muted-foreground font-medium w-8">{hole.courseHoleNumber}</td>
      <td className="px-3 py-2 text-center text-xs w-8">{par}</td>
      <td className="px-3 py-2 text-center w-12">
        <span className={`inline-flex w-9 h-7 items-center justify-center rounded text-xs font-bold ${scoreClass(hole.score, par)}`}>
          {diffLabel}
        </span>
      </td>
      <td className="px-3 py-2 text-center text-xs">{hole.putts}</td>
      <td className="px-3 py-2 text-center text-xs">
        {par === 3 ? <span className="text-muted-foreground">-</span> : hole.fir ? '✓' : <span className="text-muted-foreground">✗</span>}
      </td>
      <td className="px-3 py-2 text-center text-xs">{hole.gir ? '✓' : <span className="text-muted-foreground">✗</span>}</td>
      <td className="px-3 py-2 text-center text-xs">{hole.penalties || <span className="text-muted-foreground">-</span>}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground max-w-[6rem] truncate">{hole.memo || '-'}</td>
    </tr>
  );
}

export default function RoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: round, isLoading } = useRound(id!);
  const deleteMutation = useDeleteRound();
  const [selectedCourse, setSelectedCourse] = useState(0);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!round) return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">라운드를 찾을 수 없습니다</p>
      <Button asChild className="mt-4" variant="outline"><Link to="/rounds">목록으로</Link></Button>
    </div>
  );

  const { summary } = round;
  const frontCourse = round.playedCourses.find((c) => c.label === 'front')!;
  const backCourse  = round.playedCourses.find((c) => c.label === 'back')!;
  const frontHoles  = round.holes.filter((h) => h.roundHoleNumber <= 9);
  const backHoles   = round.holes.filter((h) => h.roundHoleNumber >= 10);

  const courses = [
    { name: frontCourse.name, holes: frontHoles, score: summary.frontNineScore, par: summary.frontNinePar },
    { name: backCourse.name,  holes: backHoles,  score: summary.backNineScore,  par: summary.backNinePar  },
  ];
  const active = courses[selectedCourse];

  const handleDelete = () => {
    if (!confirm('라운드를 삭제할까요?')) return;
    deleteMutation.mutate(round._id, { onSuccess: () => navigate('/rounds') });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{round.golfClubSnapshot.golfClubName}</h1>
          <p className="text-sm text-muted-foreground">
            {round.playedCourses.map((c) => c.name).join(' + ')} · {round.teeName} 티 · {formatDate(round.date)}
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> 삭제
        </Button>
      </div>

      {/* 스코어카드 */}
      <Card className="mb-6 overflow-hidden">
        {/* 홀별 점수 그리드 */}
        <div className="overflow-x-auto">
          {[
            { label: frontCourse.name, holes: frontHoles, total: summary.frontNineScore, par: summary.frontNinePar },
            { label: backCourse.name,  holes: backHoles,  total: summary.backNineScore,  par: summary.backNinePar  },
          ].map((row, rowIdx) => (
            <div key={rowIdx} className={`flex text-xs ${rowIdx === 0 ? 'border-b' : ''}`}>
              {/* 코스명 */}
              <div className="w-16 flex-shrink-0 flex items-center justify-center bg-muted/60 border-r px-1 py-3 text-center font-semibold text-muted-foreground leading-tight text-[10px]">
                {row.label}
              </div>
              {/* 홀별 셀 */}
              {row.holes.map((h) => {
                const diff = h.score - h.courseHoleSnapshot.par;
                const diffStr = diff === 0 ? '0' : `${diff}`;
                const color = diff <= -2 ? 'text-yellow-600' : diff === -1 ? 'text-red-500' : diff === 0 ? 'text-gray-500' : diff === 1 ? 'text-blue-500' : 'text-blue-800';
                return (
                  <div key={h.roundHoleNumber} className="flex-1 min-w-0 border-r last:border-r-0 flex items-center justify-center py-2">
                    <span className={`font-bold leading-none text-[11px] ${color}`}>{diffStr}</span>
                  </div>
                );
              })}
              {/* 합계 */}
              <div className="w-12 flex-shrink-0 flex items-center justify-center bg-muted/40 border-l py-1.5">
                <span className="font-bold text-sm leading-none text-primary">{row.total}</span>
              </div>
            </div>
          ))}
          {/* 총합 행 */}
          <div className="flex border-t bg-primary/5 text-xs">
            <div className="w-16 flex-shrink-0 flex items-center justify-center bg-muted/60 border-r px-1 py-2 text-[10px] font-semibold text-muted-foreground">
              TOTAL
            </div>
            <div className="flex-1" />
            <div className="w-12 flex-shrink-0 flex items-center justify-center border-l py-2">
              <span className="font-bold text-base leading-none text-primary">{summary.totalScore}</span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t" />

        {/* 통계 */}
        <CardContent className="py-4">
          <div className="flex">
            {[
              { label: 'FIR',      value: `${summary.firRate}%`,      sub: `${summary.firHit}/${summary.firEligible}` },
              { label: 'GIR',      value: `${summary.girRate}%`,      sub: `${summary.girHit}/18` },
              { label: '퍼트',     value: summary.totalPutts,         sub: null },
              { label: 'Scramble', value: `${summary.scrambleRate}%`, sub: `${summary.scrambleHit}/${summary.scrambleEligible}` },
            ].map((s, i) => (
              <div key={s.label} className={`flex-1 text-center ${i > 0 ? 'border-l' : ''}`}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
                {s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 홀별 기록 테이블 */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex gap-1.5">
            {courses.map((c, i) => {
              const over = c.score - c.par;
              const overStr = `${over}`;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCourse(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCourse === i
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {c.name} <span className="opacity-70">{overStr}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {['홀', 'Par', '스코어', '퍼트', 'FIR', 'GIR', '벌타', '메모'].map((h) => (
                    <th key={h} className="px-3 py-2 text-xs font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.holes.map((h) => <HoleRow key={h.roundHoleNumber} hole={h} />)}
                <tr className="bg-muted/30 border-t">
                  <td colSpan={2} className="px-3 py-2 text-xs font-semibold">합계</td>
                  <td className="px-3 py-2 text-center text-sm font-bold text-primary">
                    {(() => { const o = active.score - active.par; return o === 0 ? '0' : o > 0 ? `+${o}` : `${o}`; })()}
                  </td>
                  <td colSpan={5} />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {round.memo && (
        <Card className="mt-4">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">메모</p>
            <p className="text-sm">{round.memo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
