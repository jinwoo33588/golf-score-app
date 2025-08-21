import './RoundListToolbar.css';
import Button from '../ui/Button.jsx';

export default function RoundListToolbar({ value, onChange, onNew }){
  const set = (status)=> onChange({ status });

  return (
    <div className="rtoolbar">
      <div className="rtoolbar__filters">
        <Button variant={value.status==='all'?'primary':'ghost'} onClick={()=>set('all')}>전체</Button>
        <Button variant={value.status==='draft'?'primary':'ghost'} onClick={()=>set('draft')}>draft</Button>
        <Button variant={value.status==='final'?'primary':'ghost'} onClick={()=>set('final')}>final</Button>
      </div>
      <Button variant="primary" onClick={onNew}>+ 새 라운드</Button>
    </div>
  );
}
