// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
  //           ↑ 여기에 '/api'까지 포함되어야,
  // axios.post('/rounds') → http://localhost:4000/api/rounds 로 요청이 나감
});

// 요청 인터셉터: 요청마다 자동으로 토큰 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 자동 삽입
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
