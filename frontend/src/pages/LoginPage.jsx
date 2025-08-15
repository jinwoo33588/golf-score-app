import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../lib/authService';
import useAuth from '../lib/useAuth';
import './LoginModern.css'; // 스타일 파일 추가

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(form);       // token 저장
      await reloadUser();      // /auth/me 재조회 → TopBar에 이름 반영
      navigate('/');           // 홈으로
    } catch (e) {
      setErr(e?.response?.data?.message || '로그인 실패');
    }
  };

  return (
    <main className="login-modern">
      <form className="login-modern__form" onSubmit={onSubmit}>
        <h2 className="login-modern__title">로그인</h2>
  
        <label className="login-modern__field">
          <span>아이디 또는 이메일</span>
          <input
            name="username"
            type="text"
            placeholder="아이디 또는 이메일"
            className="login-modern__input"
            value={form.username}
            onChange={onChange}
            autoComplete="username"
            required
          />
        </label>
  
        <label className="login-modern__field">
          <span>비밀번호</span>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="login-modern__input"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
        </label>
  
        <button
          type="submit"
          className="login-modern__button"
          disabled={!form.username.trim() || !form.password.trim()}
        >
          로그인
        </button>
  
        {err && <p className="login-modern__error">{err}</p>}
  
        <p className="login-modern__footer">
          아직 계정이 없나요?{' '}
          <Link to="/register" className="login-modern__link">
            회원가입
          </Link>
        </p>
  
        {/* 선택: 게스트 사용 (별도 함수 없이 인라인 처리) */}
        <button
          type="button"
          className="login-modern__guest"
          onClick={() => {
            localStorage.setItem('token', 'guest');
            reloadUser();
            navigate('/');
          }}
        >
          게스트로 사용 (DB 없이)
        </button>
      </form>
    </main>
  );
}
