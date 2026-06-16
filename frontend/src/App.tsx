import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage    from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage   from '@/pages/DashboardPage';
import RoundsPage      from '@/pages/RoundsPage';
import NewRoundPage    from '@/pages/NewRoundPage';
import RoundDetailPage from '@/pages/RoundDetailPage';
import StatsPage       from '@/pages/StatsPage';
import CoursesPage        from '@/pages/CoursesPage';
import GolfClubDetailPage from '@/pages/GolfClubDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 인증 필요 라우트 */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/"           element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"  element={<DashboardPage />} />
              <Route path="/rounds"     element={<RoundsPage />} />
              <Route path="/rounds/new" element={<NewRoundPage />} />
              <Route path="/rounds/:id" element={<RoundDetailPage />} />
              <Route path="/stats"      element={<StatsPage />} />
              <Route path="/courses"     element={<CoursesPage />} />
              <Route path="/courses/:id" element={<GolfClubDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
