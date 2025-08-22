// src/components/stats/StatsFilters.jsx
import './StatsFilters.css';

/**
 * @param {{
 *  value: { status:'all'|'draft'|'final', from:string|null, to:string|null, q:string },
 *  onChange: (patch:Partial<typeof value>)=>void
 * }} props
 */
export default function StatsFilters({ value, onChange }) {
  const v = value || {};

  return (
    <div className="sfilters">
      <div className="sfilters__row">
        <div className="sfilters__group">
          <label className="sfilters__label">기간</label>
          <input type="date" value={v.from ?? ''} onChange={e => onChange({ from: e.target.value || null })}/>
          <span className="sfilters__dash">—</span>
          <input type="date" value={v.to ?? ''} onChange={e => onChange({ to: e.target.value || null })}/>
        </div>

        <div className="sfilters__group">
          <label className="sfilters__label">상태</label>
          <select value={v.status} onChange={e => onChange({ status: e.target.value })}>
            <option value="final">마감</option>
            <option value="draft">작성중</option>
            <option value="all">모두</option>
          </select>
        </div>

        <div className="sfilters__group sfilters__grow">
          <label className="sfilters__label">코스 검색</label>
          <input type="text" placeholder="코스명 일부" value={v.q ?? ''} onChange={e => onChange({ q: e.target.value })}/>
        </div>
      </div>
    </div>
  );
}
