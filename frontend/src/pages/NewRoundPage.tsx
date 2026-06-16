import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGolfClubs, useGolfClub } from '@/hooks/useGolfClubs';
import { useCreateRound } from '@/hooks/useRounds';
import { CreateRoundHoleRecord, GolfClub, NineCourse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, scoreClass, scoreLabel } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Search, Minus, Plus, CheckCircle2, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ── 이미지 모달 ───────────────────────────────────────────
function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5 text-white" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── 공통 타입 & 드래프트 유틸리티 ────────────────────────
interface HoleInput extends CreateRoundHoleRecord {
  par: number;
  nineCourseName: string;
  distance?: number;
  imageUrl?: string;
  touched?: boolean;
}

type Step1Data = {
  golfClubId: string; frontId: string; backId: string;
  date: string; teeName: string; weather: string; memo: string;
};

interface RoundDraft {
  step: number;
  step1Data: Step1Data | null;
  holes: HoleInput[];
  currentIdx: number;
}

const DRAFT_KEY = 'golf_round_draft';

function loadDraft(): RoundDraft | null {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null'); }
  catch { return null; }
}

export function clearDraft() { localStorage.removeItem(DRAFT_KEY); }

// ── Step 1: 기본 정보 ──────────────────────────────────
function Step1({
  onNext,
  initialData,
}: {
  onNext: (data: Step1Data) => void;
  initialData?: Step1Data;
}) {
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<GolfClub | null>(null);
  const [frontId, setFrontId] = useState(initialData?.frontId ?? '');
  const [backId, setBackId] = useState(initialData?.backId ?? '');
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().slice(0, 10));
  const [teeName, setTeeName] = useState(initialData?.teeName ?? 'White');
  const [weather, setWeather] = useState(initialData?.weather ?? '');
  const [memo, setMemo] = useState(initialData?.memo ?? '');

  // 드래프트에서 골프장 복원
  const { data: restoredClubData } = useGolfClub(initialData?.golfClubId ?? '');
  const clubRestored = useRef(false);
  useEffect(() => {
    if (restoredClubData && !clubRestored.current && initialData?.golfClubId) {
      setSelectedClub(restoredClubData as unknown as GolfClub);
      setSearch((restoredClubData as unknown as GolfClub).name);
      clubRestored.current = true;
    }
  }, [restoredClubData]);

  const { data } = useGolfClubs({ q: search || undefined, limit: 20 });
  const clubs = data?.clubs ?? [];

  const { data: clubDetail } = useGolfClub(selectedClub?._id ?? '');
  const courses: NineCourse[] = clubDetail?.nineCourses ?? [];

  const canNext = selectedClub && frontId && backId && date && teeName;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">골프장 선택</h2>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="골프장 이름 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedClub(null); }}
          />
        </div>

        {!selectedClub && clubs.length > 0 && (
          <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
            {clubs.map((club) => (
              <button
                key={club._id}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                onClick={() => { setSelectedClub(club); setSearch(club.name); setFrontId(''); setBackId(''); }}
              >
                <span className="font-medium">{club.name}</span>
                {club.region && <span className="text-muted-foreground ml-2 text-xs">{club.region}</span>}
              </button>
            ))}
          </div>
        )}

        {selectedClub && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md text-sm">
            <span className="font-medium text-primary">{selectedClub.name}</span>
            {selectedClub.region && <span className="text-muted-foreground">{selectedClub.region}</span>}
            <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => { setSelectedClub(null); setSearch(''); }}>변경</button>
          </div>
        )}
      </div>

      {selectedClub && courses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>전반 코스</Label>
            <Select value={frontId} onValueChange={setFrontId}>
              <SelectTrigger><SelectValue placeholder="전반 코스 선택" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={String(c._id)} value={String(c._id)}>{c.name} (Par {c.parTotal})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>후반 코스</Label>
            <Select value={backId} onValueChange={setBackId}>
              <SelectTrigger><SelectValue placeholder="후반 코스 선택" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={String(c._id)} value={String(c._id)}>{c.name} (Par {c.parTotal})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>날짜</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>티박스</Label>
          <Select value={teeName} onValueChange={setTeeName}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Black','Blue','White','Red','Gold','Silver'].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>날씨 (선택)</Label>
          <Input placeholder="맑음, 흐림, 비..." value={weather} onChange={(e) => setWeather(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>메모 (선택)</Label>
          <Input placeholder="라운드 메모" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
      </div>

      <Button
        className="w-full"
        disabled={!canNext}
        onClick={() => onNext({ golfClubId: selectedClub!._id, frontId, backId, date, teeName, weather, memo })}
      >
        다음 <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// ── Step 2: 홀별 카드 스와이프 입력 ──────────────────────

// Yes / - / No 3단 토글
function TriToggle({ value, onChange, disabled }: {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  disabled?: boolean;
}) {
  if (disabled) return (
    <div className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">해당없음</div>
  );
  const opts: { v: boolean | null; label: string }[] = [
    { v: true,  label: 'Yes' },
    { v: null,  label: '-'   },
    { v: false, label: 'No'  },
  ];
  return (
    <div className="flex rounded-lg border overflow-hidden">
      {opts.map(({ v, label }) => {
        const active = value === v;
        const activeClass =
          v === true  ? 'bg-primary text-white' :
          v === null  ? 'bg-muted text-foreground' :
                        'bg-red-50 text-red-600';
        return (
          <button key={label} onClick={() => onChange(v)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold transition-colors border-r last:border-r-0',
              active ? activeClass : 'bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >{label}</button>
        );
      })}
    </div>
  );
}

// +/- 스텝 버튼 컴포넌트
function StepButton({ label, value, min, max, onChange, large }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted active:scale-95 transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className={cn('font-bold tabular-nums', large ? 'text-3xl w-10 text-center' : 'text-xl w-8 text-center')}>
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 이웃 홀 미리보기 카드 (슬라이드 중 양옆에 보이는 카드)
function HolePreviewCard({ hole, teeName }: { hole: HoleInput; teeName: string }) {
  return (
    <Card className="overflow-hidden opacity-60 pointer-events-none">
      <div className="flex">
        {/* 왼쪽: 이미지 or 플레이스홀더 */}
        <div className="w-36 flex-shrink-0 self-stretch bg-muted/40 overflow-hidden">
          {hole.imageUrl ? (
            <img
              src={`${API_BASE}${hole.imageUrl}`}
              alt={`${hole.roundHoleNumber}번 홀`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
              </svg>
            </div>
          )}
        </div>
        {/* 오른쪽: 헤더 + 스코어 */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'px-3 py-2 flex items-center justify-between text-white',
            hole.par === 3 ? 'bg-blue-600' : hole.par === 5 ? 'bg-green-700' : 'bg-primary'
          )}>
            <div>
              <p className="text-[10px] opacity-75">{hole.nineCourseName}</p>
              <p className="text-base font-bold leading-tight">{hole.roundHoleNumber}번 홀</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] opacity-75">Par</p>
              <p className="text-2xl font-bold leading-tight">{hole.par}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-75">{teeName}</p>
              <p className="text-sm font-semibold">{hole.distance ? `${hole.distance}m` : '-'}</p>
            </div>
          </div>
          <CardContent className="py-8 flex justify-center">
            <span className="text-5xl font-bold text-muted-foreground">
              {hole.touched ? hole.score : '-'}
            </span>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

function Step2({
  golfClubId, frontId, backId, teeName,
  onBack, onSubmit, initialHoles, initialIdx = 0, onDraftSave,
}: {
  golfClubId: string; frontId: string; backId: string; teeName: string;
  onBack: () => void;
  onSubmit: (holes: HoleInput[]) => void;
  initialHoles?: HoleInput[];
  initialIdx?: number;
  onDraftSave?: (holes: HoleInput[], idx: number) => void;
}) {
  const { data: club } = useGolfClub(golfClubId);
  const frontCourse = club?.nineCourses.find((c) => String(c._id) === frontId);
  const backCourse  = club?.nineCourses.find((c) => String(c._id) === backId);

  const initHoles = (): HoleInput[] => {
    if (!frontCourse || !backCourse) return [];
    return [
      ...frontCourse.holes.map((h, i) => {
        const dist = (h.teeDistances ?? []).find((t) => t.teeName === teeName)?.distance;
        return {
          roundHoleNumber: i + 1,
          par: h.par,
          nineCourseName: frontCourse.name,
          distance: dist,
          imageUrl: h.imageUrl,
          score: h.par,        // 기본값: 파
          putts: 2,            // 기본값: 2퍼트
          fir: null,           // null = 미입력 (par3은 해당없음으로 표시)
          gir: null,
          penalties: 0,
          memo: '',
          touched: false,
        };
      }),
      ...backCourse.holes.map((h, i) => {
        const dist = (h.teeDistances ?? []).find((t) => t.teeName === teeName)?.distance;
        return {
          roundHoleNumber: i + 10,
          par: h.par,
          nineCourseName: backCourse.name,
          distance: dist,
          imageUrl: h.imageUrl,
          score: h.par,
          putts: 2,
          fir: null,
          gir: null,
          penalties: 0,
          memo: '',
          touched: false,
        };
      }),
    ];
  };

  const [holes, setHoles] = useState<HoleInput[]>(initialHoles ?? []);
  const [initialized, setInitialized] = useState(!!(initialHoles?.length));
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  // 캐러셀 refs
  const containerRef   = useRef<HTMLDivElement>(null);
  const dragStartX     = useRef<number | null>(null);
  const dragStartY     = useRef<number | null>(null);
  const isAnimating    = useRef(false);
  const isDraggingH    = useRef(false); // 수평 드래그 확정 여부

  // 홀/인덱스 바뀔 때마다 드래프트 저장
  useEffect(() => {
    if (holes.length > 0) onDraftSave?.(holes, currentIdx);
  }, [holes, currentIdx]);

  if (club && !initialized) {
    const init = initHoles();
    if (init.length > 0) {
      setHoles(init);
      setInitialized(true);
    }
  }

  const update = (field: keyof HoleInput, value: unknown) => {
    setHoles((prev) => prev.map((h, i) =>
      i === currentIdx ? { ...h, [field]: value, touched: true } : h
    ));
  };

  // 프로그래매틱 이동 (버튼 클릭, 스코어카드 셀 클릭)
  const goTo = (idx: number) => {
    if (isAnimating.current || idx < 0 || idx >= 18 || idx === currentIdx) return;
    const el = containerRef.current;
    isAnimating.current = true;
    const forward = idx > currentIdx;
    if (el) {
      el.style.transition = 'none';
      el.style.transform = 'translateX(-100%)';
      el.getBoundingClientRect(); // force reflow
      el.style.transition = 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)';
      el.style.transform = forward ? 'translateX(-200%)' : 'translateX(0%)';
    }
    setTimeout(() => {
      setCurrentIdx(idx);
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'none';
          containerRef.current.style.transform = 'translateX(-100%)';
        }
        isAnimating.current = false;
      });
    }, 280);
  };

  // 터치 캐러셀: touchmove로 실시간 드래그, touchend에서 스냅
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating.current) return;
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isDraggingH.current = false;
    if (containerRef.current) containerRef.current.style.transition = 'none';
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (!isDraggingH.current) {
      if (Math.abs(dy) > Math.abs(dx)) return; // 세로 스크롤 우선
      isDraggingH.current = true;
    }
    if (containerRef.current)
      containerRef.current.style.transform = `translateX(calc(-100% + ${dx}px))`;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - dragStartX.current;
    const el = containerRef.current;
    dragStartX.current = null;
    dragStartY.current = null;
    if (!isDraggingH.current) return; // 세로 스크롤이었으면 무시
    isDraggingH.current = false;

    const commit = (snapForward: boolean, nextIdx: number) => {
      isAnimating.current = true;
      if (el) {
        el.style.transition = 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)';
        el.style.transform = snapForward ? 'translateX(-200%)' : 'translateX(0%)';
      }
      setTimeout(() => {
        setCurrentIdx(nextIdx);
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            containerRef.current.style.transform = 'translateX(-100%)';
          }
          isAnimating.current = false;
        });
      }, 250);
    };

    if (delta < -60 && currentIdx < 17)      commit(true,  currentIdx + 1);
    else if (delta > 60 && currentIdx > 0)   commit(false, currentIdx - 1);
    else if (el) { // 스냅 백
      el.style.transition = 'transform 0.22s ease-out';
      el.style.transform = 'translateX(-100%)';
    }
  };

  if (!club || holes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hole = holes[currentIdx];
  const relScore = hole.score - hole.par;   // 0 = 파, -1 = 버디, +1 = 보기
  const totalScore = holes.reduce((s, h) => s + h.score, 0);
  const totalPar   = holes.reduce((s, h) => s + h.par, 0);
  const totalOver  = totalScore - totalPar;
  const filledCount = holes.filter((h) => h.touched).length;

  // 스코어 상대값 표시 (+1, 0, -1 ...)
  const relLabel = relScore === 0 ? 'E' : relScore > 0 ? `+${relScore}` : `${relScore}`;
  const relColor =
    relScore <= -1 ? 'text-red-500' :
    relScore === 0 ? 'text-gray-400' :
    relScore === 1 ? 'text-blue-500' : 'text-blue-700';

  return (
    <>
    {modalSrc && (
      <ImageModal
        src={modalSrc}
        alt={`${currentIdx + 1}번 홀`}
        onClose={() => setModalSrc(null)}
      />
    )}
    <div className="space-y-4">

      {/* 상단: 전체 진행 상황 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{filledCount}/18홀 완료</span>
        <div className="text-right">
          <span className="font-bold text-primary text-lg">{totalScore}</span>
          <span className={cn('ml-1 font-semibold text-sm', totalOver > 0 ? 'text-blue-600' : totalOver < 0 ? 'text-red-500' : 'text-gray-400')}>
            {totalOver === 0 ? 'E' : totalOver > 0 ? `+${totalOver}` : totalOver}
          </span>
        </div>
      </div>

      {/* 스코어카드 인디케이터 (2줄) */}
      <div className="rounded-lg border overflow-hidden text-xs">
        {[holes.slice(0, 9), holes.slice(9)].map((group, rowIdx) => (
          <div key={rowIdx} className={cn('flex', rowIdx === 0 ? 'border-b' : '')}>
            {/* 구분 라벨 */}
            <div className="w-8 flex-shrink-0 flex items-center justify-center bg-muted font-semibold text-muted-foreground border-r text-[10px]">
              {rowIdx === 0 ? '전' : '후'}
            </div>
            {/* 홀별 셀 */}
            {group.map((h, i) => {
              const idx = rowIdx * 9 + i;
              const diff = h.score - h.par;
              const isActive = idx === currentIdx;
              const cellBg = !h.touched
                ? 'bg-white text-gray-300'
                : diff <= -2 ? 'bg-yellow-100 text-yellow-700'
                : diff === -1 ? 'bg-red-100 text-red-600'
                : diff === 0  ? 'bg-white text-gray-500'
                : diff === 1  ? 'bg-blue-50 text-blue-600'
                :               'bg-blue-100 text-blue-800';

              return (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={cn(
                    'flex-1 flex flex-col items-center py-1.5 border-r last:border-r-0 transition-all',
                    cellBg,
                    isActive ? 'ring-2 ring-inset ring-primary' : 'hover:opacity-80'
                  )}
                >
                  <span className="text-[9px] text-muted-foreground leading-none mb-0.5">{idx + 1}</span>
                  <span className="font-bold leading-none">{h.touched ? h.score : '-'}</span>
                </button>
              );
            })}
            {/* 합계 */}
            <div className="w-9 flex-shrink-0 flex flex-col items-center justify-center bg-muted border-l">
              <span className="text-[9px] text-muted-foreground leading-none mb-0.5">합계</span>
              <span className="font-bold leading-none">
                {group.reduce((s, h) => s + h.score, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 홀 카드 — 캐러셀 (드래그 중 이웃 카드 보임) */}
      <div className="relative">
        {/* 카드 뷰포트 */}
        <div
          style={{ overflow: 'hidden' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 슬라이딩 트랙: 이전 | 현재 | 다음 */}
          <div
            ref={containerRef}
            style={{ display: 'flex', transform: 'translateX(-100%)', willChange: 'transform' }}
          >
            {/* 이전 홀 */}
            <div style={{ minWidth: '100%' }}>
              {currentIdx > 0
                ? <HolePreviewCard hole={holes[currentIdx - 1]} teeName={teeName} />
                : <div />}
            </div>

            {/* 현재 홀 (인터랙티브) */}
            <div style={{ minWidth: '100%' }}>
              <Card className="overflow-hidden">
                <div className="flex">
                  {/* 왼쪽: 홀 이미지 */}
                  <div className="w-36 flex-shrink-0 self-stretch bg-muted/40 overflow-hidden">
                    {hole.imageUrl ? (
                      <img
                        src={`${API_BASE}${hole.imageUrl}`}
                        alt={`${currentIdx + 1}번 홀`}
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() => setModalSrc(`${API_BASE}${hole.imageUrl}`)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                        </svg>
                        <span className="text-[10px]">사진 없음</span>
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 헤더 + 입력 */}
                  <div className="flex-1 min-w-0">
                    {/* 홀 헤더 */}
                    <div className={cn(
                      'px-3 py-2 flex items-center justify-between text-white',
                      hole.par === 3 ? 'bg-blue-600' : hole.par === 5 ? 'bg-green-700' : 'bg-primary'
                    )}>
                      <div>
                        <p className="text-[10px] opacity-75">{hole.nineCourseName}</p>
                        <p className="text-base font-bold leading-tight">{currentIdx + 1}번 홀</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] opacity-75">Par</p>
                        <p className="text-2xl font-bold leading-tight">{hole.par}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-75">{teeName}</p>
                        <p className="text-sm font-semibold">{hole.distance ? `${hole.distance}m` : '-'}</p>
                      </div>
                    </div>

                    <CardContent className="px-3 pt-2 pb-2 space-y-2">
                      {/* 스코어 + 퍼트 한 줄 */}
                      <div className="flex items-center justify-around">
                        <div className="flex flex-col items-center gap-0.5">
                          <StepButton
                            label="스코어 (0=파)"
                            value={relScore}
                            min={1 - hole.par}
                            max={10}
                            onChange={(v) => update('score', hole.par + v)}
                            large
                          />
                          <div className="flex items-center gap-1">
                            <span className={cn('px-1.5 py-0.5 rounded-full text-xs font-bold', scoreClass(hole.score, hole.par))}>
                              {hole.score}타
                            </span>
                            <span className={cn('text-xs font-semibold', relColor)}>
                              {relLabel}
                            </span>
                          </div>
                        </div>
                        <div className="w-px self-stretch bg-border" />
                        <StepButton label="퍼트" value={hole.putts} min={0} max={10} onChange={(v) => update('putts', v)} />
                      </div>

                      <div className="border-t" />

                      {/* FIR / GIR / 벌타 */}
                      <div className="flex items-center justify-around">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] text-muted-foreground font-medium">FIR</span>
                          <TriToggle value={hole.fir} onChange={(v) => update('fir', v)} disabled={hole.par === 3} />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] text-muted-foreground font-medium">GIR</span>
                          <TriToggle value={hole.gir} onChange={(v) => update('gir', v)} />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] text-muted-foreground font-medium">벌타</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => update('penalties', Math.max(0, hole.penalties - 1))} disabled={hole.penalties === 0}
                              className="w-6 h-6 rounded-full border flex items-center justify-center disabled:opacity-30 hover:bg-muted">
                              <Minus className="w-3 h-3" /></button>
                            <span className="text-base font-bold w-4 text-center">{hole.penalties}</span>
                            <button onClick={() => update('penalties', hole.penalties + 1)}
                              className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted">
                              <Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>

                      {/* 메모 */}
                      <input type="text" placeholder="홀 메모 (선택)" value={hole.memo ?? ''}
                        onChange={(e) => update('memo', e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>

            {/* 다음 홀 */}
            <div style={{ minWidth: '100%' }}>
              {currentIdx < 17
                ? <HolePreviewCard hole={holes[currentIdx + 1]} teeName={teeName} />
                : <div />}
            </div>
          </div>
        </div>

        {/* ← 이전 버튼 */}
        <button
          onClick={() => currentIdx === 0 ? onBack() : goTo(currentIdx - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-muted active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* → 다음 버튼 */}
        <button
          onClick={() => currentIdx < 17 ? goTo(currentIdx + 1) : onSubmit(holes)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-muted active:scale-90 transition-all"
        >
          {currentIdx < 17
            ? <ChevronRight className="w-5 h-5 text-muted-foreground" />
            : <CheckCircle2 className="w-5 h-5 text-green-700" />}
        </button>
      </div>

      {/* 마지막 홀 저장 버튼 */}
      {currentIdx === 17 && (
        <Button className="w-full bg-green-700 hover:bg-green-800" onClick={() => onSubmit(holes)}>
          <CheckCircle2 className="w-4 h-4 mr-1" />
          저장하기
        </Button>
      )}
    </div>
    </>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────
export default function NewRoundPage() {
  const navigate = useNavigate();
  const createRound = useCreateRound();

  // 드래프트 복원
  const [step, setStep] = useState<number>(() => loadDraft()?.step ?? 1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(() => loadDraft()?.step1Data ?? null);
  const restoredHoles = useRef<HoleInput[]>(loadDraft()?.holes ?? []);
  const restoredIdx   = useRef<number>(loadDraft()?.currentIdx ?? 0);

  const handleStep1 = (data: Step1Data) => {
    const prev = loadDraft();
    const sameSetup = prev?.step1Data?.golfClubId === data.golfClubId
      && prev?.step1Data?.frontId === data.frontId
      && prev?.step1Data?.backId === data.backId;
    if (!sameSetup) { restoredHoles.current = []; restoredIdx.current = 0; }
    setStep1Data(data);
    setStep(2);
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      step: 2, step1Data: data,
      holes: sameSetup ? (prev?.holes ?? []) : [],
      currentIdx: sameSetup ? (prev?.currentIdx ?? 0) : 0,
    }));
  };

  const handleDraftSave = (holes: HoleInput[], idx: number) => {
    const d = loadDraft();
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, holes, currentIdx: idx }));
  };

  const handleSubmit = (holes: HoleInput[]) => {
    if (!step1Data) return;
    createRound.mutate(
      {
        golfClubId:        step1Data.golfClubId,
        frontNineCourseId: step1Data.frontId,
        backNineCourseId:  step1Data.backId,
        date:    step1Data.date,
        teeName: step1Data.teeName,
        weather: step1Data.weather,
        memo:    step1Data.memo,
        holeRecords: holes.map(({ par: _p, nineCourseName: _n, distance: _d, touched: _t, ...r }) => ({
          ...r,
          fir: r.fir ?? false,   // null(미입력/par3) → false
          gir: r.gir ?? false,   // null(미입력) → false
        })),
      },
      { onSuccess: (round) => { clearDraft(); navigate(`/rounds/${round._id}`); } }
    );
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold',
              step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            )}>{s}</div>
            <span className={cn('text-sm', step >= s ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {s === 1 ? '기본 정보' : '스코어 입력'}
            </span>
            {s < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>라운드 기록</CardTitle></CardHeader>
          <CardContent>
            <Step1 onNext={handleStep1} initialData={step1Data ?? undefined} />
          </CardContent>
        </Card>
      )}

      {step === 2 && step1Data && (
        <Step2
          golfClubId={step1Data.golfClubId}
          frontId={step1Data.frontId}
          backId={step1Data.backId}
          teeName={step1Data.teeName}
          initialHoles={restoredHoles.current.length ? restoredHoles.current : undefined}
          initialIdx={restoredIdx.current}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          onDraftSave={handleDraftSave}
        />
      )}

      {createRound.isPending && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">저장 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}
