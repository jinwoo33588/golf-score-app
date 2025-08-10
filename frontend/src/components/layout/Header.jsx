// src/components/layout/Header.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="app-header">
      {/* 로고 */}
      <Link to="/" className="brand">
        GolfTracker
      </Link>

      {/* 상단 네비게이션 */}
      <nav className="header-nav">
        <NavLink
          to="/rounds"
          className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
        >
          라운드 목록
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
        >
          통계
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
        >
          프로필
        </NavLink>
      </nav>

      {/* 로그아웃 */}
      <button type="button" className="logout-btn" onClick={handleLogout}>
        로그아웃
      </button>
    </header>
  );
}
