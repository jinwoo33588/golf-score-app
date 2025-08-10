// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';  // TopBar 경로 확인하세요
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddRoundPage from './pages/AddRoundPage';
import RoundDetailPage from './pages/RoundDetailPage';
import RoundEditPage from './pages/RoundEditPage';
import RoundListPage from './pages/RoundListPage';
import StatsPage from './pages/StatsPage';
import RoundMasterDetailPage from './pages/RoundMasterDetailPage';

function App() {
  // undefined: 로딩 전 / null: 비로그인 / string: 토큰 존재
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken); // 없으면 null, 있으면 문자열
  }, []);

  // 토큰 확인 끝나기 전엔 라우팅/리다이렉트 금지
  if (token === undefined) {
    return <div style={{ padding: 16 }}>로딩중...</div>;
  }

  const isAuthed = Boolean(token);

  return (
    <Router>
      {isAuthed && <TopBar />}
      <Routes>
        {/* 비보호 */}
        <Route path="/login" element={isAuthed ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthed ? <Navigate to="/" replace /> : <RegisterPage />} />

        {/* 보호 */}
        <Route path="/" element={isAuthed ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/rounds/new" element={isAuthed ? <AddRoundPage /> : <Navigate to="/login" replace />} />
        <Route path="/rounds/:roundId" element={isAuthed ? <RoundDetailPage /> : <Navigate to="/login" replace />} />
        <Route path="/rounds/:roundId/edit" element={isAuthed ? <RoundEditPage /> : <Navigate to="/login" replace />} />
        <Route path="/stats" element={isAuthed ? <StatsPage /> : <Navigate to="/login" replace />} />
        {/* <Route path="/list" element={isAuthed ? <RoundListPage /> : <Navigate to="/login" replace />} /> */}
        {/* <Route path="/rounds" element={<RoundListPage />} /> */}
        <Route path="/rounds" element={<RoundMasterDetailPage />} />

        {/* 알 수 없는 경로 */}
        <Route path="*" element={<Navigate to={isAuthed ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
