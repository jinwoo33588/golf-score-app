// src/components/rounds/RoundHeader.jsx
import './RoundHeader.css';
import Button from '../ui/Button.jsx';

/**
 * props:
 *  - title, date, tee_time, status
 *  - editing: boolean
 *  - dirty: boolean  ← 변경사항 존재 여부(초안과 동일 개념)
 *  - onBack, onEdit, onCancel, onSave, onFinalize, onRefresh
 */
export default function RoundHeader({
  title, date, tee_time, status,
  editing, dirty,
  onBack, onEdit, onCancel, onSave, onFinalize, onRefresh
}) {
  return (
    <div className="rhdr">
      <div className="rhdr__l">
        <div className="rhdr__title">
          {title}
          {editing && (
            <span className={`editBadge ${dirty ? 'is-dirty' : ''}`}>
              {dirty ? '편집 중 · 변경됨' : '편집 중'}
            </span>
          )}
        </div>
        <div className="rhdr__sub">
          <span>{date}</span>
          {tee_time ? <span>• {tee_time}</span> : null}
          <span className={`badge ${status==='final'?'badge--final':'badge--draft'}`}>{status}</span>
        </div>
      </div>
      <div className="rhdr__r">
        <Button variant="ghost" onClick={onBack}>← 목록</Button>
        <Button variant="ghost" onClick={onRefresh}>새로고침</Button>

        {!editing ? (
          <>
            <Button onClick={onEdit}>수정</Button>
            <Button variant="primary" onClick={onFinalize}>마감</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onCancel}>취소</Button>
            <Button variant="primary" onClick={onSave} disabled={!dirty}>전체 저장</Button>
          </>
        )}
      </div>
    </div>
  );
}
