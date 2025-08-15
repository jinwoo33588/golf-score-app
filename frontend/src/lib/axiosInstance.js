import axio from 'axios';

const api = axio.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
})


// 추후 인증 토큰을 헤더에 추가하는 로직을 여기에 추가할 수 있습니다.

export default api;