// src/components/layout/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import { AUTH_THEME } from '../../config/themeConfig';

export default function AuthLayout() {
  return (
    <div data-theme={AUTH_THEME}>
      <Outlet />
    </div>
  );
}
