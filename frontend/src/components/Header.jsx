// src/components/Header.jsx
import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../lib/useAuth';
import './Header.css';

export default function Header() {
  const { user } = (typeof useAuth === 'function' ? useAuth() : {}) || {};
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="header__inner">
        {/* 브랜드 */}
        <Link to="/" className="header__brand">
          <span className="header__logo-dot" />
          GolfTracker
        </Link>

        {/* 햄버거 (모바일) */}
        <button
          type="button"
          className="header__menu-btn"
          aria-label="Toggle navigation"
          onClick={() => setOpen(v => !v)}
        >
          <span className="header__menu-icon" />
        </button>

        {/* 네비게이션 */}
        <nav className={`header__nav ${open ? 'is-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `header__link ${isActive ? 'is-active' : ''}`
            }
            onClick={() => setOpen(false)}
          >
            홈
          </NavLink>

          {/* 필요한 라우트만 남겨서 쓰세요 */}
          <NavLink
            to="/rounds"
            className={({ isActive }) =>
              `header__link ${isActive ? 'is-active' : ''}`
            }
            onClick={() => setOpen(false)}
          >
            라운드
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `header__link ${isActive ? 'is-active' : ''}`
            }
            onClick={() => setOpen(false)}
          >
            통계
          </NavLink>
        </nav>

        {/* 유저/로그아웃 */}
        <div className="header__actions">
          {user?.name ? (
            <span className="header__user">👋 {user.name}</span>
          ) : null}
          <button type="button" className="header__logout" onClick={logout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
