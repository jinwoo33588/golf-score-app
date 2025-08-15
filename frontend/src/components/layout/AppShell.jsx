// src/components/layout/AppShell.jsx
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import './AppShell.css';
import { APP_THEME } from '../../config/themeConfig';

export default function AppShell() {
  return (
    <div className="app-shell" data-theme={APP_THEME}>
      <Header />
      <main className="app-shell__content">
        <div className="app-shell__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
