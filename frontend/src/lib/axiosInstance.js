import axios from 'axios';

const baseURL =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  'http://127.0.0.1:4000/api'; // ← localhost 대신 127.0.0.1 권장

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
});

// 요청: 토큰 자동 첨부 + (DEV) 로깅
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (import.meta.env.DEV) {
    console.log('[REQ]', config.method?.toUpperCase(), config.url, config.params || '', config.data || '');
  }
  return config;
});

// ✅ 응답: (DEV) 로깅 + 401 처리 — 한 인터셉터로 통합
axiosInstance.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.log('[RES]', res.status, res.config.url, res.data);
    }
    return res;
  },
  (err) => {
    const status = err?.response?.status;
    const url = err.config ? `${err.config.baseURL || ''}${err.config.url || ''}` : '(no url)';

    if (import.meta.env.DEV) {
      if (status) console.warn('[ERR]', status, url, err.response?.data);
      else console.warn('[ERR-NETWORK]', err.code || '(no code)', url, err.message);
    }

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
