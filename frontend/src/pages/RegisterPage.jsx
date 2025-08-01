// src/pages/RegisterPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:4000/api/register', {
        email,
        password: pw,
      });
      alert('회원가입 성공! 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      console.error('회원가입 에러:', err.response?.data);
      alert(err.response?.data?.error || '회원가입 실패');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">회원가입</h2>
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
        className="w-full border p-2 mb-4"
      />
      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 w-full"
      >
        회원가입
      </button>
    </div>
  );
};

export default RegisterPage;
