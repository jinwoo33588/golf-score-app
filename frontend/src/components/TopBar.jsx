import React from 'react';
import { Link } from 'react-router-dom';
import './TopBar.css'; // 스타일시트 경로를 맞춰주세요

const Topbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <hearde className="topbar">
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
    </hearde>
    // <header className="bg-white shadow sticky top-0 z-20">
    //   <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
    //     {/* 로고 */}
    //     <Link to="/" className="text-2xl font-extrabold text-gray-800">
    //       GolfTracker
    //     </Link>

    //     {/* 네비게이션 */}
    //     <nav className="flex space-x-6">
    //       <Link
    //         to="/rounds"
    //         className="text-gray-600 hover:text-gray-900 transition-colors"
    //       >
    //         라운드 목록
    //       </Link>
    //       <Link
    //         to="/stats"
    //         className="text-gray-600 hover:text-gray-900 transition-colors"
    //       >
    //         통계
    //       </Link>
    //       <Link
    //         to="/profile"
    //         className="text-gray-600 hover:text-gray-900 transition-colors"
    //       >
    //         프로필
    //       </Link>
    //     </nav>

    //     {/* 프로필 / 로그아웃 버튼 */}
    //     <div>
    //       <button onClick={handleLogout} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
    //         로그아웃
    //       </button>
    //     </div>
    //   </div>
    // </header>

    // <div className="bg-gray-800 text-white px-4 py-2 flex justify-between">
    //   <h1 className="text-lg font-bold">🏌️‍♂️ Golf App</h1>
    //   <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
    //     로그아웃
    //   </button>
    // </div>
  );
};

export default Topbar;
