// src/services/roundService.js
import axios from './axiosInstance';

// 백엔드가 GET /rounds에서 배열을 바로 반환하므로 res.data 를 사용합니다.
export const getRounds = () =>
  axios.get('/rounds')
    .then(res =>
      // res.data: 백엔드 배열
      res.data.map(r => ({
        id:       r.id,
        course:   r.course_name,         // 코스명
        date:     r.date.slice(0,10),    // YYYY-MM-DD
        score:    r.totalScore,          // 백엔드 totalScore
        weather:  r.weather
      }))
    );
// GET /rounds/:id에서 단일 라운드 객체를 바로 반환하므로 res.data 를 사용합니다.
export const getRoundDetail = (id) =>
  axios.get(`/rounds/${id}`)
    .then(res => {
      const r = res.data;
      // 여기서 한 번만 매핑!
      return {
        id:         r.id,
        course:     r.course_name,
        date:       r.date,
        score:      r.totalScore,
        totalPutts: r.totalPutts,
        fir:        r.firPercent,
        gir:        r.girPercent,
        holes:      r.holes.map(h => ({
          id:         h.id,
          hole:       h.hole_number,
          par:        h.par,
          score:      h.score,
          teeShot:    h.shots.find(s => s.shot_number===1)?.club,
          approach:   h.shots.find(s => s.shot_number===2)?.club,
          putts:      h.putts
        }))
      };
    });
// POST /rounds는 { round } 형태로 반환하므로 res.data.round 사용
export const createRound = (payload) =>
  axios.post('/rounds', payload).then(res => res.data.round);

// PUT /rounds/:id 역시 { round } 반환
export const updateRound = (id, payload) =>
  axios.put(`/rounds/${id}`, payload).then(res => res.data.round);

// DELETE /rounds/:id는 응답 바디가 없거나 필요 없으므로 바로 호출
export const deleteRound = (id) =>
  axios.delete(`/rounds/${id}`);