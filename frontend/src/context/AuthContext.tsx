import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import client from '@/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
  });

  // 앱 시작 시 토큰 있으면 내 정보 조회
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    client.get('/auth/me')
      .then((res) => setState({ user: res.data.user, token, isLoading: false }))
      .catch(() => {
        localStorage.removeItem('token');
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isLoading: false });
  };

  const setUser = (user: User) =>
    setState((s) => ({ ...s, user }));

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
