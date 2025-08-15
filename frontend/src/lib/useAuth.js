import { useEffect, useState, useCallback } from 'react';
import { fetchMe } from './authService';

export default function useAuth() {
  const [user, setUser] = useState(undefined); // undefined: 로딩 / null: 비로그인 / object: 로그인

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); return; }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  // 첫 마운트 시 1회
  useEffect(() => { loadMe(); }, [loadMe]);

  // ✅ 로그인/로그아웃 시 커스텀 이벤트로 재조회
  useEffect(() => {
    const onAuthChanged = () => loadMe();
    window.addEventListener('auth:changed', onAuthChanged);

    // 다른 탭 동기화까지 고려(선택)
    const onStorage = (e) => { if (e.key === 'token') loadMe(); };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('auth:changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadMe]);

  return { user, setUser, reloadUser: loadMe, isLoading: user === undefined };
}
