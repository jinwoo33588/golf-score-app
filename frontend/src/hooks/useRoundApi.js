import axiosInstance from '../lib/axiosInstance'; // ✅ 여기만 고정

const api = axiosInstance;

/** 공통 에러 메시지 추출 */
export function errMsg(e) {
  return e?.response?.data?.error?.message
      || e?.response?.data?.message
      || e?.message
      || 'Error';
}

/** 라운드 목록(요약 포함) */
export async function listRounds(params = {}) {
  const { data } = await api.get('/rounds', { params });
  return data.data; // RoundListItem[]
}

/** 라운드 생성 → id 반환 */
export async function createRound(body) {
  const { data } = await api.post('/rounds', body);
  return data.data.id;
}

/** 라운드 삭제 */
export async function removeRound(id) {
  await api.delete(`/rounds/${id}`);
}

/** 상세 */
export async function getRoundDetail(id) {
  const { data } = await api.get(`/rounds/${id}`);
  return data.data; // { round, holes }
}

/** 통계 */
export async function getRoundStats(id, mode = 'partial') {
  const { data } = await api.get(`/rounds/${id}/stats`, { params: { mode } });
  return data.data; // RoundStats
}

/** 단일 홀 수정 */
export async function updateHole(holeId, patch) {
  const { data } = await api.put(`/holes/${holeId}`, patch);
  return data.data; // Hole
}

/** 벌크 업데이트 */
export async function bulkUpdateHoles(roundId, items) {
  const { data } = await api.put(`/rounds/${roundId}/holes`, items);
  return data.data; // Hole[]
}

/** 라운드 메타/상태 수정 */
export async function updateRoundMeta(id, patch) {
  const { data } = await api.put(`/rounds/${id}`, patch);
  return data.data; // Round
}