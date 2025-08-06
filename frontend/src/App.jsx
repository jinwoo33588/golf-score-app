// src/app/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';  // TopBar 경로 확인하세요
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddRoundPage from './pages/AddRoundPage';
import RoundDetailPage from './pages/RoundDetailPage';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
  }, []);

  return (
    <Router>
     {token && <TopBar />}    {/* 로그인 상태일 때만 TopBar 렌더링 */}
      <Routes>
        {/* 로그인 페이지: 이미 로그인되어 있으면 “/”로 */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* 보호된(로그인 필요) 페이지들 */}
        <Route
          path="/"
          element={token ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/rounds/new"
          element={token ? <AddRoundPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/rounds/:roundId"
          element={token ? <RoundDetailPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
