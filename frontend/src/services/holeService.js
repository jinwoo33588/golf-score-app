import axios from './axiosInstance';

// 벌크 생성
export const createHoles = (roundId, holes) =>
  axios.post(`/rounds/${roundId}/holes`, { holes }).then(res => res.data);

// 라운드의 홀들 조회
export const getHolesByRound = (roundId) =>
  axios.get(`/rounds/${roundId}/holes`).then(res => res.data);

// ✅ 개별 홀 수정 (백엔드 라우트와 매칭)
export const updateHole = (holeId, patch) =>
  axios.put(`/holes/${holeId}`, patch).then(res => res.data);
