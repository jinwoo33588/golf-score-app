// src/services/shotService.js
import axios from './axiosInstance';

/**
 * 샷 여러 개 생성 (권장)
 * 컨트롤러(createShotsHandler)가 일반적으로 { shots: [...] }를 기대하므로 그 형태로 보냅니다.
 */
export const createShots = (holeId, shots) =>
  axios.post(`/holes/${holeId}/shots`, { shots })
       .then(res => res.data);

/** 샷 하나만 생성하는 편의 함수 */
export const createShot = (holeId, shot) =>
  createShots(holeId, [shot]);

/** 특정 홀의 샷들 조회: 배열 그대로 반환 */
export const getShots = (holeId) =>
  axios.get(`/holes/${holeId}/shots`)
       .then(res => (res.data ?? []).map(s => ({
         id:             s.id,
         hole_id:        s.hole_id,
         shot_number:    s.shot_number,
         club:           s.club,
         condition:      s.condition,
         remaining_dist: s.remaining_dist ?? null,
         actual_dist:    s.actual_dist ?? null,
         result:         s.result,
         notes:          s.notes ?? null,
       })));

export const updateShot = (shotId, patch) =>
  axios.put(`/shots/${shotId}`, patch).then(res => res.data);

export const deleteShot = (shotId) =>
  axios.delete(`/shots/${shotId}`).then(res => res.data);
