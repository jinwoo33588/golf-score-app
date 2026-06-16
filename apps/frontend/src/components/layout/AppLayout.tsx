import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, PlusCircle, BarChart2, MapPin, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV = [
  { to: '/dashboard',  label: '홈',      icon: LayoutDashboard },
  { to: '/rounds',     label: '라운드',  icon: ListOrdered },
  { to: '/rounds/new', label: '기록',    icon: PlusCircle },
  { to: '/stats',      label: '통계',    icon: BarChart2 },
  { to: '/courses',    label: '골프장',  icon: MapPin },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── 데스크탑 사이드바 (md 이상에서만 표시) ── */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-white">
        {/* 로고 */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">⛳</span>
          </div>
          <span className="font-bold text-primary text-lg">Golf Score</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* 유저 정보 */}
        <div className="border-t px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nickname}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* ── 모바일/데스크탑 공통 레이아웃 ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* 모바일 상단 헤더 (md 미만에서만 표시) */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs">⛳</span>
            </div>
            <span className="font-bold text-primary">Golf Score</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{user?.nickname}</span>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* ── 모바일 하단 탭바 (md 미만에서만 표시) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t">
          <div className="flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'w-10 h-6 flex items-center justify-center rounded-full transition-colors',
                      // 라운드 기록 버튼은 강조
                      to === '/rounds/new'
                        ? isActive
                          ? 'bg-primary'
                          : 'bg-primary/90'
                        : isActive
                          ? 'bg-primary/10'
                          : ''
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        to === '/rounds/new' ? 'text-white' : ''
                      )} />
                    </div>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
          {/* iOS 홈 인디케이터 여백 */}
          <div className="h-safe-area-inset-bottom bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
        </nav>

      </div>
    </div>
  );
}
