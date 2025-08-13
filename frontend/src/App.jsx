// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 헤더만 포함된 앱 셸 레이아웃 (AppShell 내부에 <Header /> + <Outlet /> 있음)
import AppShell from './components/layout/AppShell';

// 페이지들
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddRoundPage from './pages/AddRoundPage';
import RoundDetailPage from './pages/RoundDetailPage';
import RoundEditPage from './pages/RoundEditPage';
import StatsPage from './pages/StatsPage';
import RoundMasterDetailPage from './pages/RoundMasterDetailPage';
import UiSandboxPage from './pages/UiSandboxPage';
import UiTestPage from './pages/UiTestPage';
import HoleCardsSandbox from './pages/test/HoleCardsSandbox';

// 보호 래퍼: 인증 전이면 /login 으로 보냄
function RequireAuth({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  // undefined: 로딩 전 / null: 비로그인 / 문자열: 토큰 존재
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
      <Routes>
        {/* 비보호 라우트 (헤더 없음) */}
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthed ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* 보호 라우트 (헤더 포함 AppShell) */}
        <Route
          element={
            <RequireAuth isAuthed={isAuthed}>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/rounds" element={<RoundMasterDetailPage />} />
          <Route path="/rounds/new" element={<AddRoundPage />} />
          <Route path="/rounds/:roundId" element={<RoundDetailPage />} />
          <Route path="/rounds/:roundId/edit" element={<RoundEditPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<div>프로필</div>} />
          <Route path="/ui-sandbox" element={<UiSandboxPage/>} />
          <Route path="/ui-test" element={<UiTestPage />} />
          <Route path="/test/hole-cards" element={<HoleCardsSandbox />} />

        </Route>

        {/* 알 수 없는 경로 */}
        <Route
          path="*"
          element={<Navigate to={isAuthed ? '/' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
