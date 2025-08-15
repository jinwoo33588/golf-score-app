
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HealthCheckPage from './pages/HealthCheckPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/health" element={<HealthCheckPage/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
        {/* 정의되지 않은 경로는 홈으로 리다이렉트 */}
      </Routes>
    </BrowserRouter>
  );
}
