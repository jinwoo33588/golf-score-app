import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRounds, useDeleteRound } from '@/hooks/useRounds';
import { Button } from '@/components/ui/button';
import { signedStr } from '@/lib/utils';
import { Round } from '@/types';

// 스코어에 따라 배지 색상
function scoreBadgeColor(over: number) {
  if (over <= 0)  return 'bg-red-500';
  if (over <= 9)  return 'bg-blue-500';
  if (over <= 18) return 'bg-indigo-400';
  return 'bg-gray-400';
}

function RoundRow({ round, onDelete }: { round: Round; onDelete: (id: string) => void }) {
  const over = round.summary.overPar;
  const courseNames = round.playedCourses.map((c) => c.name).join(' / ');
  const [y, m, d] = round.date.split('-');

  const { girHit, girRate, firHit, firEligible, firRate, scrambleHit, scrambleEligible, scrambleRate } = round.summary;
  const stats = [
    { label: 'PUTT',     main: `${round.summary.totalPutts}`,  sub: null },
    { label: 'GIR',      main: `${girRate}%`,                  sub: `${girHit}/18` },
    { label: 'FIR',      main: `${firRate}%`,                  sub: `${firHit}/${firEligible}` },
    { label: 'Scramble', main: `${scrambleRate}%`,             sub: `${scrambleHit}/${scrambleEligible}` },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Link to={`/rounds/${round._id}`} className="block">
        {/* 상단: 코스명 + 스코어 배지 */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-muted-foreground mb-0.5">{courseNames}</p>
            <p className="text-xl font-bold leading-tight truncate">{round.golfClubSnapshot.golfClubName}</p>
          </div>
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${scoreBadgeColor(over)}`}>
            <span className="text-white text-3xl font-bold">{round.summary.totalScore}</span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t mx-4" />

        {/* 날짜 · 날씨 */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span>{y}.{m}.{d}</span>
          {round.weather && (
            <>
              <span className="text-gray-300">|</span>
              <span>{round.weather}</span>
            </>
          )}
          <span className="text-gray-300">|</span>
          <span>{round.teeName} 티</span>
        </div>

        {/* 구분선 */}
        <div className="border-t mx-4" />

        {/* 통계 */}
        <div className="flex px-4 py-3">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex-1 flex flex-col items-center ${i > 0 ? 'border-l border-gray-200' : ''}`}>
              <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
              <p className="text-base font-bold mt-0.5 leading-none">{s.main}</p>
              {s.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      </Link>

      {/* 삭제 버튼 */}
      <div className="border-t mx-4" />
      <div className="flex justify-end px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs gap-1"
          onClick={() => { if (confirm('라운드를 삭제할까요?')) onDelete(round._id); }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          삭제
        </Button>
      </div>
    </div>
  );
}

export default function RoundsPage() {
  const [page, setPage] = useState(1);
  const [year, setYear] = useState<string | undefined>(undefined);
  const { data, isLoading } = useRounds({ page, limit: 10, year });
  const deleteMutation = useDeleteRound();
  const rounds = data?.rounds ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);
  const years = data?.years ?? [];

  const handleYearChange = (y: string | undefined) => {
    setYear(y);
    setPage(1);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">라운드</h1>
          <p className="text-sm text-muted-foreground mt-0.5">총 {total}개</p>
        </div>
        <Button asChild size="sm">
          <Link to="/rounds/new"><PlusCircle className="w-4 h-4 mr-1.5" />기록하기</Link>
        </Button>
      </div>

      {/* 연도 필터 */}
      {years.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => handleYearChange(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !year ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            전체
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => handleYearChange(y)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                year === y ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : rounds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">기록된 라운드가 없습니다</p>
            <Button asChild className="mt-4"><Link to="/rounds/new">첫 라운드 기록하기</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {rounds.map((r) => (
              <RoundRow key={r._id} round={r} onDelete={(id) => deleteMutation.mutate(id)} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</Button>
              <span className="flex items-center text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
