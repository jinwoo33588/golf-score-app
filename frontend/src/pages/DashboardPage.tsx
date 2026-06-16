import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PlusCircle, TrendingUp, Target, Flag, PlayCircle, RotateCcw } from 'lucide-react';
import { useRounds } from '@/hooks/useRounds';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Round } from '@/types';

function StatCard({ title, value, sub, icon: Icon }: { title: string; value: string; sub?: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoundCard({ round }: { round: Round }) {
  const over = round.summary.overPar;
  return (
    <Link to={`/rounds/${round._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{round.golfClubSnapshot.golfClubName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {round.playedCourses.map((c) => c.name).join(' + ')}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(round.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{round.summary.totalScore}</p>
              <p className="text-xs text-muted-foreground">{round.teeName} 티</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const DRAFT_KEY = 'golf_round_draft';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useRounds({ limit: 5 });
  const rounds = data?.rounds ?? [];

  // 기록 중인 라운드 드래프트 감지
  const [draft, setDraft] = useState<{ holes?: { touched?: boolean }[]; currentIdx?: number } | null>(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null'); }
    catch { return null; }
  });

  const handleResume = () => navigate('/rounds/new');
  const handleNewRound = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
    navigate('/rounds/new');
  };

  const draftProgress = draft?.holes?.filter((h) => h.touched).length ?? 0;

  // 평균 계산
  const avg = rounds.length
    ? (rounds.reduce((s, r) => s + r.summary.totalScore, 0) / rounds.length).toFixed(1)
    : '-';
  const bestScore = rounds.length
    ? Math.min(...rounds.map((r) => r.summary.totalScore))
    : null;
  const avgGir = rounds.length
    ? (rounds.reduce((s, r) => s + r.summary.girRate, 0) / rounds.length).toFixed(1)
    : '-';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">안녕하세요, {user?.nickname}님 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">최근 라운드 기록을 확인하세요</p>
        </div>
        <Button asChild>
          <Link to="/rounds/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            라운드 기록
          </Link>
        </Button>
      </div>

      {/* 기록 중인 라운드 배너 */}
      {draft && (
        <Card className="mb-6 border-primary/40 bg-primary/5">
          <CardContent className="py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary">기록 중인 라운드</p>
              <p className="text-xs text-muted-foreground">{draftProgress}/18홀 완료</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" className="text-xs gap-1 h-8" onClick={handleNewRound}>
                <RotateCcw className="w-3 h-3" />새 라운드
              </Button>
              <Button size="sm" className="text-xs h-8" onClick={handleResume}>
                이어서 기록
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="평균 스코어" value={avg} sub={`최근 ${rounds.length}라운드`} icon={TrendingUp} />
        <StatCard title="베스트 스코어" value={bestScore ? String(bestScore) : '-'} icon={Flag} />
        <StatCard title="평균 GIR" value={avgGir !== '-' ? `${avgGir}%` : '-'} icon={Target} />
      </div>

      {/* 최근 라운드 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">최근 라운드</h2>
          <Link to="/rounds" className="text-sm text-primary hover:underline">전체 보기</Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : rounds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">아직 기록된 라운드가 없습니다</p>
              <Button asChild className="mt-4">
                <Link to="/rounds/new">첫 라운드 기록하기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rounds.map((r) => <RoundCard key={r._id} round={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
