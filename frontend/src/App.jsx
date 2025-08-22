import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 레이아웃
import AppShell from './components/layout/AppShell';
import AuthLayout from './components/layout/AuthLayout';

// 페이지
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import RoundsListPage from './pages/RoundsListPage';
import RoundDetailPage from './pages/RoundDetailPage';
import StatsPage from './pages/StatsPage';
import CalendarPage from './pages/CalendarPage';
import CalendarTest from './pages/CalendarTest';

// 인증 보호
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
  return (
    <Router>
    <Routes>
      {/* (1) 인증 전 전용 레이아웃: Topbar 없음 */}
      <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

      {/* (2) 앱 레이아웃: Topbar 고정 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/rounds" element={<RoundsListPage />} />
          <Route path="/rounds/:id" element={<RoundDetailPage />} />
          <Route path="/stats" element={<StatsPage />} /> 
          <Route path="/calendar" element={<CalendarTest />} />
          {/* <Route path="/rounds" element={<RoundListPage />} />
          <Route path="/rounds/:roundId" element={<RoundDetailPage />} />
          <Route path="/rounds/:roundId/edit" element={<RoundEditPage />} />
          <Route path="/add" element={<AddRoundPage />} />
          <Route path="/stats" element={<StatsPage />} /> */}
        </Route>
      </Route>

      {/* 기타 → 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
  );
}
