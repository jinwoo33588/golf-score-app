import './RoundCard.css';
import StatChip from '../ui/StatChip.jsx';
import Button from '../ui/Button.jsx';

/**
 * @param {{
 *   item: {
 *     id:number, date:string, course_name:string, status:'draft'|'final',
 *     to_par_partial:number|null, putts_partial:number|null, fir_pct:number|null, gir_pct:number|null
 *   },
 *   onOpen:(id:number)=>void,
 *   onDelete:(id:number)=>void
 * }} props
 */
export default function RoundCard({ item, onOpen, onDelete }){
  return (
    <div className="rcard">
      <div className="rcard__top">
        <div className="rcard__title">{item.course_name}</div>
        <span className={`badge ${item.status==='final'?'badge--final':'badge--draft'}`}>
          {item.status}
        </span>
      </div>
      <div className="rcard__sub">{item.date}</div>

      <div className="rcard__stats">
        <StatChip label="to-par" value={item.to_par_partial} mode="par" />
        <StatChip label="putts" value={item.putts_partial} />
        <StatChip label="FIR" value={item.fir_pct} mode="pct" />
        <StatChip label="GIR" value={item.gir_pct} mode="pct" />
      </div>

      <div className="rcard__actions">
        <Button variant="ghost" onClick={()=>onOpen(item.id)}>열기</Button>
        <Button variant="danger" onClick={()=>onDelete(item.id)}>삭제</Button>
      </div>
    </div>
  );
}
