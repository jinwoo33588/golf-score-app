import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, X, Loader2, MapPin } from 'lucide-react';
import { useGolfClub, useUploadHoleImage, useDeleteHoleImage } from '@/hooks/useGolfClubs';
import { Button } from '@/components/ui/button';
import { NineCourse, CourseHole } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ── 이미지 모달 ────────────────────────────────────────────
function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
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

// ── 홀 슬라이드 카드 (이미지 + 업로드) ────────────────────
function HoleSlide({
  hole,
  clubId,
  active,
  onModalOpen,
}: {
  hole: CourseHole;
  clubId: string;
  active: boolean;
  onModalOpen: (src: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadHoleImage(clubId);
  const del    = useDeleteHoleImage(clubId);
  const holeId = hole._id ?? '';
  const isPending = upload.isPending || del.isPending;
  const imgSrc = hole.imageUrl ? `${API_BASE}${hole.imageUrl}` : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && holeId) upload.mutate({ holeId, file });
    e.target.value = '';
  };

  return (
    <div
      className="relative w-2/3 mx-auto bg-black rounded-xl overflow-hidden"
      style={{ aspectRatio: '3/4' }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`홀 ${hole.holeNumber}`}
          className={`w-full h-full object-contain ${active ? 'cursor-zoom-in' : ''}`}
          onClick={() => active && onModalOpen(imgSrc)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
          </svg>
          <p className="text-xs opacity-40">사진 없음</p>
        </div>
      )}

      {/* 업로드/삭제 버튼 (active 홀만) */}
      {active && holeId && (
        <div className="absolute bottom-2 right-2">
          {imgSrc ? (
            <button
              className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); del.mutate(holeId); }}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <X className="w-3.5 h-3.5 text-white" />}
            </button>
          ) : (
            <button
              className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <ImagePlus className="w-3.5 h-3.5 text-white" />}
            </button>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── 티별 거리 (컬러 dot + 숫자) ────────────────────────────
const TEE_COLORS: Record<string, string> = {
  Black: 'bg-gray-900',
  Blue:  'bg-blue-500',
  White: 'bg-gray-300 border border-gray-400',
  Gold:  'bg-yellow-400',
  Silver:'bg-gray-400',
  Red:   'bg-red-500',
};

function TeeDistances({ hole }: { hole: CourseHole }) {
  const tees = (hole.teeDistances ?? []).filter((t) => t.distance);
  if (tees.length === 0) return null;
  return (
    <div className="flex gap-3 flex-wrap">
      {tees.map((t) => (
        <div key={t.teeName} className="flex items-center gap-1">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${TEE_COLORS[t.teeName] ?? 'bg-gray-400'}`} />
          <span className="text-xs font-medium">{t.distance}<span className="text-[10px] text-muted-foreground ml-0.5">m</span></span>
        </div>
      ))}
    </div>
  );
}

// ── 코스 캐러셀 ─────────────────────────────────────────────
function CourseCarousel({ course, clubId }: { course: NineCourse; clubId: string }) {
  const holes = course.holes;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX   = useRef<number | null>(null);
  const dragStartY   = useRef<number | null>(null);
  const isAnimating  = useRef(false);
  const isDraggingH  = useRef(false);

  const goTo = (idx: number) => {
    if (isAnimating.current || idx < 0 || idx >= holes.length || idx === currentIdx) return;
    const el = containerRef.current;
    isAnimating.current = true;
    const forward = idx > currentIdx;
    if (el) {
      el.style.transition = 'none';
      el.style.transform = 'translateX(-100%)';
      el.getBoundingClientRect();
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
      if (Math.abs(dy) > Math.abs(dx)) return;
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
    if (!isDraggingH.current) return;
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

    if (delta < -60 && currentIdx < holes.length - 1) commit(true,  currentIdx + 1);
    else if (delta > 60 && currentIdx > 0)            commit(false, currentIdx - 1);
    else if (el) {
      el.style.transition = 'transform 0.22s ease-out';
      el.style.transform = 'translateX(-100%)';
    }
  };

  const hole = holes[currentIdx];
  const parColor =
    hole.par === 3 ? 'text-blue-600' :
    hole.par === 5 ? 'text-green-700' :
    'text-foreground';

  return (
    <>
      {modalSrc && (
        <ImageModal src={modalSrc} alt="홀 사진" onClose={() => setModalSrc(null)} />
      )}

      {/* 홀 정보 (이미지 위) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">{hole.holeNumber}</span>
          <span className="text-xs text-muted-foreground font-medium">홀</span>
          <span className={`text-lg font-bold ${parColor}`}>Par {hole.par}</span>
          {hole.handicapIndex != null && (
            <span className="text-xs text-muted-foreground">HCP {hole.handicapIndex}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{currentIdx + 1} / {holes.length}</div>
      </div>

      {/* 캐러셀 뷰포트 */}
      <div
        style={{ overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={containerRef}
          style={{ display: 'flex', transform: 'translateX(-100%)', willChange: 'transform' }}
        >
          {/* 이전 홀 */}
          <div style={{ minWidth: '100%' }} className="opacity-50 pointer-events-none">
            {currentIdx > 0
              ? <HoleSlide hole={holes[currentIdx - 1]} clubId={clubId} active={false} onModalOpen={() => {}} />
              : <div style={{ aspectRatio: '16/9' }} className="bg-muted/30 rounded-xl" />}
          </div>
          {/* 현재 홀 */}
          <div style={{ minWidth: '100%' }}>
            <HoleSlide hole={hole} clubId={clubId} active={true} onModalOpen={setModalSrc} />
          </div>
          {/* 다음 홀 */}
          <div style={{ minWidth: '100%' }} className="opacity-50 pointer-events-none">
            {currentIdx < holes.length - 1
              ? <HoleSlide hole={holes[currentIdx + 1]} clubId={clubId} active={false} onModalOpen={() => {}} />
              : <div style={{ aspectRatio: '16/9' }} className="bg-muted/30 rounded-xl" />}
          </div>
        </div>
      </div>

      {/* 네비게이션 + 거리 */}
      <div className="flex items-center justify-between mt-3 px-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={currentIdx === 0}
          onClick={() => goTo(currentIdx - 1)}
          className="w-9 h-9"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <TeeDistances hole={hole} />

        <Button
          variant="ghost"
          size="icon"
          disabled={currentIdx === holes.length - 1}
          onClick={() => goTo(currentIdx + 1)}
          className="w-9 h-9"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────
export default function GolfClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: club, isLoading } = useGolfClub(id!);
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);

  const courses = club?.nineCourses
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [];

  const selectedCourse: NineCourse | undefined = courses[selectedCourseIdx];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">골프장을 찾을 수 없습니다</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/courses">목록으로</Link>
        </Button>
      </div>
    );
  }

  const totalPar   = club.nineCourses.reduce((s, c) => s + c.parTotal, 0);
  const totalHoles = club.nineCourses.reduce((s, c) => s + c.holeCount, 0);

  return (
    <div className="max-w-xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{club.name}</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            {club.region && (
              <>
                <MapPin className="w-3 h-3" />
                <span>{club.region}</span>
                <span>·</span>
              </>
            )}
            <span>{totalHoles}홀</span>
            <span>·</span>
            <span>Par {totalPar}</span>
          </div>
        </div>
      </div>

      {/* 코스 배지 */}
      <div className="flex gap-2 px-4 pb-5 flex-wrap">
        {courses.map((course, i) => (
          <button
            key={String(course._id)}
            onClick={() => setSelectedCourseIdx(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCourseIdx === i
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* 홀 캐러셀 */}
      {selectedCourse && (
        <div className="px-4 pb-8">
          <CourseCarousel
            key={String(selectedCourse._id)}
            course={selectedCourse}
            clubId={club._id}
          />
        </div>
      )}
    </div>
  );
}
