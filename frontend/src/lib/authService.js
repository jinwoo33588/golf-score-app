import axios from './axiosInstance';

export async function register({ username, password, name }) {
  const { data } = await axios.post('/auth/register', { username, password, name });
  return data;
}

export async function login({ username, password }) {
  const { data } = await axios.post('/auth/login', { username, password });
  localStorage.setItem('token', data.token);

  // ✅ 로그인 상태 변경 알림 (같은 탭에서도 수신되도록 커스텀 이벤트 사용)
  window.dispatchEvent(new Event('auth:changed'));

  return data.user;
}

export async function fetchMe() {
  const { data } = await axios.get('/auth/me');
  return data.user; // { id, username, name }
}

export function logout() {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth:changed')); // ✅ 로그아웃도 알림
  window.location.href = '/login';
}
