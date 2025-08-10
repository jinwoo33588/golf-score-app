import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useRounds from '../hooks/useRounds';
import useScrollChain from '../hooks/useScrollChain'; // ✅ 추가
import RoundCardItem from '../components/card/RoundCardItem';
import RoundDetailPanel from '../components/panel/RoundDetailPanel';
import './RoundMasterDetailPage.css';

function useIsSplit() {
  const query = '(min-width: 1200px)';
  const get = () => window.matchMedia(query).matches;
  const [ok, setOk] = useState(get());
  useEffect(() => {
    const m = window.matchMedia(query);
    const h = (e) => setOk(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return ok;
}

export default function RoundMasterDetailPage() {
  const navigate = useNavigate();
  const { rounds = [], loading, error } = useRounds();
  const isSplit = useIsSplit();

  // 오른쪽 컨테이너(폭) 열림 여부
  const [detailOpen, setDetailOpen] = useState(false);
  // 표시 중인 패널 id (null이면 닫힘 애니메이션 시작)
  const [selectedId, setSelectedId] = useState(null);
  // 컨테이너 전환이 끝난 뒤 마운트할 후보 id
  const [pendingId, setPendingId] = useState(null);

  // ✅ 스크롤 체이닝용 ref (좌/우 스크롤 박스)
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);

  // ✅ 오른쪽 컨테이너(폭 전환 transitionend 받기)
  const rightContainerRef = useRef(null);

  // 빠른 필터/정렬
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('all');
  const [range, setRange] = useState('all');      // all | 30 | 90
  const [sort, setSort] = useState('date_desc');  // date_desc | date_asc | score_asc | score_desc
  const [status, setStatus] = useState('all');    // all | done | draft

  const courseOptions = useMemo(() => {
    const set = new Set();
    rounds.forEach(r => r.course && set.add(r.course));
    return ['all', ...Array.from(set)];
  }, [rounds]);

  const filtered = useMemo(() => {
    let arr = [...rounds];
    const isDraft = (r) => (r.status ? r.status === 'draft' : r.totalScore == null);

    const q = query.trim().toLowerCase();
    if (q) arr = arr.filter(r => r.course?.toLowerCase().includes(q) || (r.date && r.date.toLowerCase().includes(q)));
    if (course !== 'all') arr = arr.filter(r => r.course === course);

    if (range !== 'all') {
      const days = Number(range);
      const since = new Date();
      since.setDate(since.getDate() - days);
      arr = arr.filter(r => {
        const d = new Date(r.date);
        return !isNaN(d) && d >= since;
      });
    }

    if (status !== 'all') arr = arr.filter(r => status === 'draft' ? isDraft(r) : !isDraft(r));

    switch (sort) {
      case 'date_asc':   arr.sort((a,b) => (a.date > b.date ? 1 : -1)); break;
      case 'score_asc':  arr.sort((a,b) => (a.totalScore ?? 9e9) - (b.totalScore ?? 9e9)); break;
      case 'score_desc': arr.sort((a,b) => (b.totalScore ?? -9e9) - (a.totalScore ?? -9e9)); break;
      default:           arr.sort((a,b) => (a.date < b.date ? 1 : -1)); // 최신순
    }
    return arr;
  }, [rounds, query, course, range, sort, status]);

  // 스택 모드로 내려가면 닫기
  useEffect(() => {
    if (!isSplit) { setDetailOpen(false); setSelectedId(null); setPendingId(null); }
  }, [isSplit]);

  const onClickCard = (id) => {
    if (!isSplit) return navigate(`/rounds/${id}`);
    if (detailOpen) {
      setSelectedId(id); // 교체
    } else {
      setPendingId(id);  // 대기 → 폭 전환 끝나면 마운트
      setDetailOpen(true);
    }
  };

  const onEdit = (id) => navigate(`/rounds/${id}/edit`);

  const onDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    // TODO: 삭제 API 연동 후 목록 리패치
    navigate('/rounds'); window.location.reload();
  };

  const onCloseDetail = () => {
    setSelectedId(null); // 콘텐츠 exit → onExitComplete에서 접힘
  };

  // 오른쪽 컨테이너(max-width) 전환 완료 → pending 패널 마운트
  useEffect(() => {
    const el = rightContainerRef.current;
    if (!el) return;
    const onEnd = (e) => {
      if (e.target !== el) return;
      if (e.propertyName !== 'max-width') return;
      if (pendingId != null) {
        setSelectedId(pendingId);
        setPendingId(null);
      }
    };
    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, [pendingId]);

  // ✅ 스크롤 체이닝 활성화
  useScrollChain(leftScrollRef);
  useScrollChain(rightScrollRef);

  if (loading) return <div className="round-mdp page">로딩 중...</div>;
  if (error)   return <div className="round-mdp page error">불러오기 실패</div>;

  const EmptyState = (
    <div className="empty">
      <p>아직 라운드가 없습니다.</p>
      <button className="primary" onClick={() => navigate('/add-round')}>+ 첫 라운드 추가</button>
    </div>
  );

  return (
    <div className={`round-mdp ${isSplit ? 'split' : 'stack'} ${isSplit ? (detailOpen ? 'detail-open' : 'collapsed') : ''}`}>
      {/* 좌측 리스트 */}
      <aside className="left">
        <div className="toolbar">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="코스/날짜 검색" aria-label="라운드 검색" />
          <select value={course} onChange={e=>setCourse(e.target.value)} aria-label="코스 필터">
            {courseOptions.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '전체 코스' : opt}</option>)}
          </select>
          <select value={range} onChange={e=>setRange(e.target.value)} aria-label="기간 필터">
            <option value="all">전체 기간</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} aria-label="상태 필터">
            <option value="all">전체 상태</option>
            <option value="done">작성완료</option>
            <option value="draft">작성중</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="정렬">
            <option value="date_desc">날짜 최신순</option>
            <option value="date_asc">날짜 오래된순</option>
            <option value="score_asc">스코어 낮은순</option>
            <option value="score_desc">스코어 높은순</option>
          </select>
          <button className="primary" onClick={()=>navigate('/add-round')}>+ 새 라운드</button>
        </div>

        <div className="left-scroll" ref={leftScrollRef} tabIndex={-1}>
          <div className={isSplit ? 'list' : 'grid'}>
            {filtered.length === 0 ? EmptyState : filtered.map(r => (
              <RoundCardItem
                key={r.id}
                round={r}
                selected={isSplit && r.id === selectedId}
                onClick={() => onClickCard(r.id)}
                onEdit={() => onEdit(r.id)}
                onDelete={() => onDelete(r.id)}
                variant={isSplit ? 'list' : 'grid'}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* 오른쪽 패널 */}
      {isSplit && (
        <main className="right" ref={rightContainerRef}>
          <div className="right-scroll" ref={rightScrollRef} tabIndex={-1}>
            <AnimatePresence
              mode="wait"
              onExitComplete={() => {
                if (!selectedId) setDetailOpen(false);
              }}
            >
              {selectedId && (
                <motion.div
                  key={`panel-${selectedId}`}
                  className="right-pane"
                  initial={{ x: 20, opacity: 0, scale: 0.985 }}
                  animate={{ x: 0,  opacity: 1, scale: 1 }}
                  exit={{ x: 16, opacity: 0, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.9 }}
                >
                  <RoundDetailPanel
                    roundId={selectedId}
                    onEdit={() => onEdit(selectedId)}
                    onClose={onCloseDetail}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      )}
    </div>
  );
}
