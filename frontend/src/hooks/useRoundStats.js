import useFetch from './_useFetch';
import { fetchRoundStats } from '../services/statsService';

export function useRoundStats(roundId, mode = 'partial') {
  // roundId가 없으면 호출 안 되게 처리
  return useFetch(
    ({ signal }) => (roundId
      ? fetchRoundStats(roundId, mode, { signal })
      : Promise.resolve(null)),
    [roundId, mode]
  );
}
