import React, { useState, useMemo } from 'react';
import './RoundCardItem.css';

export default function RoundCardItem({
  round,
  selected,
  onClick,
  onEdit,
  onDelete,
  variant = 'list', // 'list' | 'grid'
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = (e) => { e.stopPropagation(); setMenuOpen(v => !v); };
  const closeMenu = (e) => { e.stopPropagation(); setMenuOpen(false); };

  // 상태/지표 계산(서버 파생필드 없을 때 대비)
  const status = round?.status ?? (round?.totalScore == null ? 'draft' : 'done');
  const toPar = useMemo(() => {
    if (round?.totalToPar != null) return round.totalToPar;
    if (round?.totalScore != null && round?.totalPar != null) {
      return round.totalScore - round.totalPar;
    }
    return null;
  }, [round]);

  const firPct = round?.firPct != null ? round.firPct : null;
  const girPct = round?.girPct != null ? round.girPct : null;

  const badgeText = status === 'draft' ? '작성중' : '작성완료';
  const badgeClass = status === 'draft' ? 'badge draft' : 'badge done';

  return (
    <article
      className={`round-card-item ${variant} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      tabIndex={0}
      aria-selected={!!selected}
    >
      {/* 메뉴 버튼 (우측 상단 고정) */}
      <button
        className="menu-btn"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        title="메뉴"
      >
        ⋯
      </button>
      {menuOpen && (
        <div className="menu" role="menu" onClick={(e) => e.stopPropagation()}>
          <button role="menuitem" onClick={(e) => { e.stopPropagation(); onEdit?.(); closeMenu(e); }}>수정</button>
          <button role="menuitem" className="danger" onClick={(e) => { e.stopPropagation(); onDelete?.(); closeMenu(e); }}>삭제</button>
        </div>
      )}

      {/* 헤더: 좌측(코스명+날짜+뱃지) / 우측(큰 스코어) */}
      <header className="header">
        <div className="title-side">
          <div className="title-line">
            <h3 className="course">{round?.course_name || round?.course}</h3>
            <time className="date">{(round?.date || '').slice(0, 10)}</time>
            <span className={badgeClass}>{badgeText}</span>
          </div>
        </div>

        <div className="score-side" aria-label="총 스코어">
          <div className="score-label">Score</div>
          <div className="score-value">{round?.totalScore ?? '-'}</div>
        </div>
      </header>

      {/* 하단 메트릭: To-Par / 퍼팅 / FIR / GIR */}
      <div className="metrics">
        <div className="metric">
          <span className="label">To-Par</span>
          <strong className="value">{toPar ?? '-'}</strong>
        </div>
        <div className="metric">
          <span className="label">퍼팅</span>
          <strong className="value">{round?.totalPutts ?? '-'}</strong>
        </div>
        <div className="metric">
          <span className="label">FIR</span>
          <strong className="value">{firPct != null ? `${firPct}%` : '-'}</strong>
        </div>
        <div className="metric">
          <span className="label">GIR</span>
          <strong className="value">{girPct != null ? `${girPct}%` : '-'}</strong>
        </div>
      </div>
    </article>
  );
}
