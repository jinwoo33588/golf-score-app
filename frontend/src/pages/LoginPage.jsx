// src/pages/LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    localStorage.setItem('token', 'LOCAL-GUEST'); // 임시 토큰
    localStorage.setItem('userId', 'guest');      // 필요시
    window.location.href = '/ui-sandbox';         // HashRouter면 '/#/ui-sandbox'
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/login', {
        email,
        password: pw,
      });

      const token = res.data.token;
      localStorage.setItem('token', token); // ✅ 토큰 저장
      navigate('/'); // ✅ 홈 화면으로 이동
    } catch (err) {
      alert(err.response?.data?.error || '로그인 실패');
    }
  };

  return (
    <div className="login-modern">
      <h2 className="login-modern__title">로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        className="login-modern__input"
        value={email}
        onChange={e => setEmail(e.target.value)}
        // …state, onChange 등은 생략
      />
      <input
        type="password"
        placeholder="비밀번호"
        className="login-modern__input"
        value={pw}
        onChange={e => setPw(e.target.value)}
      />
      <button 
       onClick={handleLogin}
       className="login-modern__button"
      >
        로그인
      </button>
      <p className="login-modern__footer">
        아직 계정이 없나요?{' '}
        <a href="/register" className="login-modern__link">회원가입</a>
      </p>

      <button
        type="button"
        onClick={handleGuestLogin}
        style={{ width:'100%', padding:'12px', borderRadius:10, marginTop:8 }}
      >
        게스트로 사용 (DB 없이)
      </button>
    </div>

    
  );
};

export default LoginPage;
