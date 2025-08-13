import React from 'react';
import NumberStepper from '../unified/NumberStepper';
import { YesNoToggle, YesNoBadge } from '../unified/YesNoToggle';
import ShotList from '../unified/ShotList';
import Modal from '../Modal';
import '../unified/unified.css';  // 통합된 스타일시트

export default function HoleCardUnified({
  hole,
  onChange,           // (updatedHole) => void
  mode = 'view',      // 'view' | 'edit' (add도 edit 동일 처리)
  showShots = true,
}) {
  const editable = mode !== 'view';
  const h = hole || {};
  const n = (x, def = 0) => (typeof x === 'number' ? x : Number(x) || def);
  const patch = (key, val) => onChange && onChange({ ...h, [key]: val });

  // --- 모달 상태 & 드래프트 ---
  const [openNotes, setOpenNotes] = React.useState(false);
  const [openShots, setOpenShots] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState(h?.notes || '');
  const [shotsDraft, setShotsDraft] = React.useState(h?.shots || []);

  React.useEffect(() => { setNotesDraft(h?.notes || ''); }, [h?.notes]);
  React.useEffect(() => { setShotsDraft(h?.shots || []); }, [h?.shots]);

  // 드래프트용 샷 핸들러 (모달 내부에서만 사용)
  const addShotDraft = (s) => setShotsDraft(prev => [...prev, s]);
  const changeShotDraft = (idx, newShot) => {
    const next = [...shotsDraft];
    next[idx] = newShot;
    setShotsDraft(next);
  };
  const removeShotDraft = (idx) => {
    const next = [...shotsDraft];
    next.splice(idx, 1);
    setShotsDraft(next);
  };

  return (
    <div className={`gt-holecard ${editable ? 'is-edit' : 'is-view'}`}>
      {/* === 한 줄 레이아웃 === */}
      <div className="gt-holegrid gt-row">
        {/* 헤더 */}
        <div className="gt-holehead__left">
          <div className="gt-hole-num">{h.hole_number}H</div>
          <div className="gt-hole-meta">Par {h.par}</div>
        </div>

        {/* 스테퍼들 */}
        <NumberStepper
          label="스코어(±)"
          value={n(h.score, 0)}
          onChange={(v) => patch('score', v)}
          allowTyping={false}
          disabled={!editable}
          min={-10}
          max={10}
        />
        <NumberStepper
          label="퍼팅수"
          value={n(h.putts, 0)}
          onChange={(v) => patch('putts', v)}
          allowTyping={false}
          disabled={!editable}
          min={0}
          max={10}
        />
        <NumberStepper
          label="페널티"
          value={n(h.penalties, 0)}
          onChange={(v) => patch('penalties', v)}
          allowTyping={false}
          disabled={!editable}
          min={0}
          max={10}
        />

        {/* FIR/GIR */}
        {editable ? (
          <>
            <YesNoToggle
              label="FIR"
              value={!!h.fir}
              onChange={(v) => patch('fir', v)}
            />
            <YesNoToggle
              label="GIR"
              value={!!h.gir}
              onChange={(v) => patch('gir', v)}
            />
          </>
        ) : (
          <div className="gt-hole-badges">
            <div className="gt-badge">FIR <YesNoBadge value={!!h.fir} /></div>
            <div className="gt-badge">GIR <YesNoBadge value={!!h.gir} /></div>
          </div>
        )}

        {/* 오른쪽으로 밀기 위한 스페이서 */}
        <div className="gt-spacer-flex" />

        {/* 노트/샷 버튼 */}
        <div className="gt-inline-actions">
          <button type="button" className="gt-btn" onClick={() => setOpenNotes(true)}>
            Note{/* 노트 {h?.notes ? '보기/편집' : '작성'} */}
          </button>
          {showShots && (
            <button type="button" className="gt-btn" onClick={() => setOpenShots(true)}>
              샷 {Array.isArray(h?.shots) ? `(${h.shots.length})` : ''}
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
          onAdd={addShotDraft}            // (s)
          onChange={changeShotDraft}      // (idx, newShot)
          onRemove={removeShotDraft}      // (idx)
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
