import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function RoundCreateDialog({ open, onClose, onCreate }){
  const [form, setForm] = useState({ course_name:'', date:'', tee_time:'' });
  const disabled = !form.course_name || !form.date;

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>취소</Button>
      <Button variant="primary" disabled={disabled} onClick={()=>{
        onCreate({ course_name: form.course_name, date: form.date, tee_time: form.tee_time || null });
      }}>생성</Button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title="새 라운드" footer={footer}>
      <label className="fld">
        <span className="fld__label">코스명</span>
        <input className="fld__input" placeholder="예) Lake CC"
               value={form.course_name} onChange={e=>setForm(f=>({...f, course_name:e.target.value}))}/>
      </label>
      <label className="fld">
        <span className="fld__label">날짜</span>
        <input className="fld__input" type="date"
               value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))}/>
      </label>
      <label className="fld">
        <span className="fld__label">티타임</span>
        <input className="fld__input" type="time"
               value={form.tee_time} onChange={e=>setForm(f=>({...f, tee_time:e.target.value}))}/>
      </label>
    </Modal>
  );
}
