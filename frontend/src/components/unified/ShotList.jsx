// src/components/unified/ShotList.jsx
import React from 'react';

function ShotRow({ shot, index, onChange, onRemove, editable }) {
  const handle = (key, val) => onChange && onChange(index, { ...shot, [key]: val });

  if (!editable) {
    return (
      <div className="gt-shotrow is-view">
        <div className="gt-shotcol idx">#{index + 1}</div>
        <div className="gt-shotcol">{shot.club || '-'}</div>
        <div className="gt-shotcol">{shot.condition || '-'}</div>
        <div className="gt-shotcol">{shot.remaining_dist ?? '-'}</div>
        <div className="gt-shotcol">{shot.actual_dist ?? '-'}</div>
        <div className="gt-shotcol">{shot.result || '-'}</div>
        <div className="gt-shotcol notes">{shot.notes || ''}</div>
      </div>
    );
  }

  return (
    <div className="gt-shotrow is-edit">
      <div className="gt-shotcol idx">#{index + 1}</div>
      <input
        className="gt-shotcol"
        placeholder="클럽"
        value={shot.club || ''}
        onChange={(e) => handle('club', e.target.value)}
      />
      <input
        className="gt-shotcol"
        placeholder="상태(라이)"
        value={shot.condition || ''}
        onChange={(e) => handle('condition', e.target.value)}
      />
      <input
        className="gt-shotcol"
        type="number"
        placeholder="남은거리"
        value={shot.remaining_dist ?? ''}
        onChange={(e) => handle('remaining_dist', e.target.value === '' ? null : Number(e.target.value))}
      />
      <input
        className="gt-shotcol"
        type="number"
        placeholder="실제거리"
        value={shot.actual_dist ?? ''}
        onChange={(e) => handle('actual_dist', e.target.value === '' ? null : Number(e.target.value))}
      />
      <input
        className="gt-shotcol"
        placeholder="결과"
        value={shot.result || ''}
        onChange={(e) => handle('result', e.target.value)}
      />
      <input
        className="gt-shotcol notes"
        placeholder="메모"
        value={shot.notes || ''}
        onChange={(e) => handle('notes', e.target.value)}
      />
      <button type="button" className="gt-shotremove" onClick={() => onRemove && onRemove(index)}>
        삭제
      </button>
    </div>
  );
}

export default function ShotList({
  shots = [],
  editable = false,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div className="gt-shotlist">
      <div className="gt-shotheader">
        <div className="gt-shotcol">#</div>
        <div className="gt-shotcol">클럽</div>
        <div className="gt-shotcol">상태</div>
        <div className="gt-shotcol">남은</div>
        <div className="gt-shotcol">실제</div>
        <div className="gt-shotcol">결과</div>
        <div className="gt-shotcol notes">메모</div>
        {editable && <div className="gt-shotcol actions"></div>}
      </div>

      {shots.length === 0 && !editable && (
        <div className="gt-shotempty">샷 기록 없음</div>
      )}

      {shots.map((s, i) => (
        <ShotRow
          key={i}
          index={i}
          shot={s}
          editable={editable}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}

      {editable && (
        <button
          type="button"
          className="gt-shotadd"
          onClick={() =>
            onAdd &&
            onAdd({
              club: '',
              condition: '',
              remaining_dist: null,
              actual_dist: null,
              result: '',
              notes: '',
            })
          }
        >
          + 샷 추가
        </button>
      )}
    </div>
  );
}
