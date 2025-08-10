// src/services/roundService.js
import axios from './axiosInstance';

/**
 * GET /rounds
 * → [{ id, user_id, course_name, date, weather, totalScore, firPercent, girPercent }, ...]
 *
 * 기존 컴포넌트 호환을 위해 alias(course, score)도 함께 제공합니다.
 */
export const getRounds = () =>
  axios.get('/rounds').then(res =>
    (res.data ?? []).map(r => ({
      id:          r.id,
      user_id:     r.user_id,
      course_name: r.course_name,
      date:        r.date,       // 포맷은 컴포넌트에서 slice(0,10)로 처리
      weather:     r.weather,
      totalScore:  r.totalScore,
      firPercent:  r.firPercent,
      girPercent:  r.girPercent,

      // UI 호환 alias
      course:      r.course_name,
      score:       r.totalScore,
    }))
  );

/**
 * GET /rounds/:id
 * → { ...round, holes: [...] }
 * 스키마 키를 그대로 유지하고, 편의 파생필드(teeShot/approach)만 추가.
 * 기존 UI 호환 alias(course, score, fir, gir)도 함께 제공.
 */
export const getRoundDetail = (id) =>
  axios.get(`/rounds/${id}`).then(res => {
    const r = res.data ?? {};

    const holes = (r.holes ?? []).map(h => {
      const shots = (h.shots ?? []).map(s => ({
        id:             s.id,
        hole_id:        s.hole_id,
        shot_number:    s.shot_number,
        club:           s.club,
        condition:      s.condition,
        remaining_dist: s.remaining_dist ?? null,
        actual_dist:    s.actual_dist ?? null,
        result:         s.result,
        notes:          s.notes ?? null,
      }));

      return {
        id:          h.id,
        round_id:    h.round_id,
        hole_number: h.hole_number,
        par:         h.par,
        score:       h.score ?? null,
        putts:       h.putts ?? null,
        gir:         !!h.gir,
        fw_hit:      !!h.fw_hit,
        penalties:   h.penalties ?? 0,
        notes:       h.notes ?? null,
        shots,

        // 파생(편의) 필드
        teeShot:     shots.find(s => s.shot_number === 1)?.club ?? null,
        approach:    shots.find(s => s.shot_number === 2)?.club ?? null,
      };
    });

    return {
      id:         r.id,
      user_id:    r.user_id,
      course_name:r.course_name,
      date:       r.date,
      weather:    r.weather,
      totalScore: r.totalScore,
      totalPutts: r.totalPutts,
      firPercent: r.firPercent,
      girPercent: r.girPercent,
      holes,

      // UI 호환 alias
      course:     r.course_name,
      score:      r.totalScore,
      fir:        r.firPercent,
      gir:        r.girPercent,
    };
  });

/** POST /rounds → { round } */
export const createRound = (payload) =>
  axios.post('/rounds', payload).then(res => res.data.round);

/** (백엔드에 PUT 라우트가 실제로 있어야 동작합니다) */
export const updateRound = (id, payload) =>
  axios.put(`/rounds/${id}`, payload).then(res => res.data.round);

/** DELETE /rounds/:id */
export const deleteRound = (id) =>
  axios.delete(`/rounds/${id}`);
