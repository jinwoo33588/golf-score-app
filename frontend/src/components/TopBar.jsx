import React from 'react';
import { Link } from 'react-router-dom';
import './TopBar.css'; // 스타일시트 경로를 맞춰주세요

const Topbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="topbar">
      <div className="topbar-container">
        {/* 로고 */}
        <Link to="/" className="topbar-logo">
          GolfTracker
        </Link>
        {/* 네비게이션 */}
        <nav className="topbar-nav">
          <Link to="/rounds">라운드 목록</Link>
          <Link to="/stats">통계</Link>
          <Link to="/profile">프로필</Link>
        </nav>

        {/* 로그아웃 버튼 */}
        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
        >
          로그아웃
        </button>

      </div>
    </div>
  );
};

export default Topbar;
