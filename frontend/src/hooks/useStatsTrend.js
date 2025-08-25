import useFetch from './_useFetch';
import { fetchTrend } from '../services/statsService';

export function useStatsTrend(params = { limit: 8, includeDraft: false }) {
  return useFetch(
    ({ signal }) => fetchTrend(params, { signal }),
    [JSON.stringify(params || {})]
  );
}
