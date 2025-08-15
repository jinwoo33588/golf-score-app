import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../lib/authService';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk(false);
    try {
      await register(form);
      setOk(true);
      setTimeout(() => navigate('/login'), 800);
    } catch (e) {
      setErr(e?.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <div style={{maxWidth:360,margin:'40px auto'}}>
      <h1>회원가입</h1>
      <form onSubmit={onSubmit} style={{display:'grid',gap:8}}>
        <input name="username" placeholder="아이디" value={form.username} onChange={onChange} />
        <input name="name" placeholder="표시 이름(선택)" value={form.name} onChange={onChange} />
        <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={onChange} />
        <button type="submit">등록</button>
        {err && <div style={{color:'crimson'}}>{err}</div>}
        {ok && <div style={{color:'green'}}>가입 완료! 로그인 화면으로 이동합니다…</div>}
      </form>
      <div style={{marginTop:8}}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}
