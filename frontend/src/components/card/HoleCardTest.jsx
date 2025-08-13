// src/components/card/HoleCardTest.jsx
import React from 'react';
import ShotList from '../unified/ShotList';
import Modal from '../Modal';          // 기존 Modal.jsx 사용
import '../unified/unified.css';                // 스타일 통합
import StatChip from '../unified/StatChip';  // 통합된 StatChip 컴포넌트

export default function HoleCardTest({
  hole,
  onChange,            // (updatedHole) => void
  mode = 'view',       // 'view' | 'edit' (add도 edit 동일)
  showShots = true,
}) {
  const editable = mode !== 'view';
  const h = hole || {};
  const patch = (key, val) => onChange && onChange({ ...h, [key]: val });

  // ---- 모달 상태 & 드래프트 ----
  const [openNotes, setOpenNotes] = React.useState(false);
  const [openShots, setOpenShots] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState(h?.notes || '');
  const [shotsDraft, setShotsDraft] = React.useState(h?.shots || []);

  // 외부 값 변경 시 동기화
  React.useEffect(() => { setNotesDraft(h?.notes || ''); }, [h?.notes]);
  React.useEffect(() => { setShotsDraft(h?.shots || []); }, [h?.shots]);

  return (
    <div className={`gt-holecard ${editable ? 'is-edit' : 'is-view'}`}>
      {/* === 한 줄 레이아웃: 헤더 → 칩들 → (spacer) → 노트/샷 버튼 === */}
      <div className="gt-holegrid">
        {/* 헤더 */}
        <div className="gt-holehead__left">
          <div className="gt-hole-num">{h.hole_number}H</div>
          <div className="gt-hole-meta">Par {h.par}</div>
        </div>

        {/* 칩 한 줄 (StatChip: view/edit 자동 전환) */}
        <div className="gt-statrow">
          <StatChip
            label="Score (±)"
            mode={mode}
            variant="number"
            value={h.score ?? 0}
            onChange={(v) => patch('score', v)}
            min={-10}
            max={10}
            scoreColors
          />
          <StatChip
            label="FIR"
            mode={mode}
            variant="toggle"
            value={h.fir ?? null}
            onChange={(v) => patch('fir', v)}
          />
          <StatChip
            label="GIR"
            mode={mode}
            variant="toggle"
            value={h.gir ?? null}
            onChange={(v) => patch('gir', v)}
          />
          <StatChip
            label="Putts"
            mode={mode}
            variant="number"
            value={h.putts ?? 0}
            onChange={(v) => patch('putts', v)}
            min={0}
            max={10}
          />
          <StatChip
            label="Penalties"
            mode={mode}
            variant="number"
            value={h.penalties ?? 0}
            onChange={(v) => patch('penalties', v)}
            min={0}
            max={10}
          />
        </div>

        {/* 오른쪽으로 밀기 */}
        <div className="gt-spacer-flex" />

        {/* 노트/샷 버튼 */}
        <div className="gt-inline-actions">
          <button type="button" className="gt-btn" onClick={() => setOpenNotes(true)}>
            노트 {h?.notes ? '보기/편집' : '작성'}
          </button>
          {showShots && (
            <button type="button" className="gt-btn" onClick={() => setOpenShots(true)}>
              샷 {Array.isArray(h?.shots) ? `(${h?.shots?.length || 0})` : ''}
            </button>
          )}
        </div>
      </div>

      {/* ===== Notes Modal ===== */}
      <Modal open={openNotes} onClose={() => setOpenNotes(false)} title={`노트 - ${h.hole_number}H`}>
        {editable ? (
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            style={{ width: '100%', minHeight: 120 }}
            placeholder="메모를 입력하세요"
          />
        ) : (
          <div className={`gt-notes__view ${notesDraft ? '' : 'is-empty'}`}>
            {notesDraft || '메모 없음'}
          </div>
        )}

        <div className="gt-modal-actions">
          <button type="button" className="gt-btn ghost" onClick={() => setOpenNotes(false)}>닫기</button>
          {editable && (
            <button
              type="button"
              className="gt-btn primary"
              onClick={() => { patch('notes', notesDraft); setOpenNotes(false); }}
            >
              저장
            </button>
          )}
        </div>
      </Modal>

      {/* ===== Shots Modal ===== */}
      <Modal open={openShots} onClose={() => setOpenShots(false)} title={`샷 - ${h.hole_number}H`}>
        <ShotList
          shots={shotsDraft}
          editable={editable}
          onAdd={(s) => setShotsDraft((prev) => [...prev, s])}
          onChange={(idx, newShot) =>
            setShotsDraft((prev) => {
              const next = [...prev];
              next[idx] = newShot;
              return next;
            })
          }
          onRemove={(idx) =>
            setShotsDraft((prev) => {
              const next = [...prev];
              next.splice(idx, 1);
              return next;
            })
          }
        />
        <div className="gt-modal-actions">
          <button type="button" className="gt-btn ghost" onClick={() => setOpenShots(false)}>닫기</button>
          {editable && (
            <button
              type="button"
              className="gt-btn primary"
              onClick={() => { patch('shots', shotsDraft); setOpenShots(false); }}
            >
              저장
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}


