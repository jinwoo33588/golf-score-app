// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const loc = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  return <Outlet />;
}
