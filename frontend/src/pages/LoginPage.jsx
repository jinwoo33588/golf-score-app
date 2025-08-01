// src/pages/LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const navigate = useNavigate();

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
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={pw}
        onChange={e => setPw(e.target.value)}
        className="w-full border p-2 mb-2"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 w-full"
      >
        로그인
      </button>
      <p className="text-sm mt-4">
  아직 계정이 없나요?{' '}
  <a href="/register" className="text-blue-600 underline">
    회원가입
  </a>
</p>


    </div>
    
    
  );
};

export default LoginPage;
