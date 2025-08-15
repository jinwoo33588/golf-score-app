// src/config/themeConfig.js
// 허용 값: 'navy' | 'light' | 'dim' | 'forest'
export const APP_THEME  = import.meta.env.VITE_APP_THEME  || 'navy';   // 앱 내부 페이지
export const AUTH_THEME = import.meta.env.VITE_AUTH_THEME || 'navy';   // 로그인/회원가입
