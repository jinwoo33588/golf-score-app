import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRounds, createRound, removeRound, errMsg } from '../hooks/useRoundApi.js';
import RoundListToolbar from '../components/rounds/RoundListToolbar.jsx';
import RoundCard from '../components/rounds/RoundCard.jsx';
import RoundCreateDialog from '../components/rounds/RoundCreateDialog.jsx';
import './RoundsListPage.css';

export default function RoundsListPage(){
  const nav = useNavigate();
  const [filters, setFilters] = useState({ status: 'all' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  async function load(){
    try{
      setLoading(true);
      const params = { limit: 50 };
      if (filters.status !== 'all') params.status = filters.status;
      const data = await listRounds(params);
      setRows(data);
      setError(null);
    }catch(e){ setError(errMsg(e)); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [filters]);

  async function handleCreate(body){
    try{
      const id = await createRound(body);
      setOpenCreate(false);
      await load();
      nav(`/rounds/${id}`); // 바로 상세로 이동(원치 않으면 주석 처리)
    }catch(e){ alert(errMsg(e)); }
  }
  async function handleDelete(id){
    if(!confirm('삭제할까요? 라운드의 홀 데이터도 함께 삭제됩니다.')) return;
    try{ await removeRound(id); await load(); } catch(e){ alert(errMsg(e)); }
  }

  return (
    <div className="container">
      <div className="h1">내 라운드</div>
      <RoundListToolbar value={filters} onChange={(p)=>setFilters(s=>({...s,...p}))} onNew={()=>setOpenCreate(true)} />

      {error && <div className="rlp__error">{error}</div>}
      {loading ? (
        <div className="rlp__box">로딩 중…</div>
      ) : rows.length === 0 ? (
        <div className="rlp__box">라운드가 없습니다. 우측 상단의 “+ 새 라운드”로 추가해보세요.</div>
      ) : (
        <div className="rgrid">
          {rows.map(r => (
            <RoundCard key={r.id} item={r} onOpen={(id)=>nav(`/rounds/${id}`)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <RoundCreateDialog open={openCreate} onClose={()=>setOpenCreate(false)} onCreate={handleCreate} />
    </div>
  );
}
