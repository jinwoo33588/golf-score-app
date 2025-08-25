import useFetch from './_useFetch';
import { fetchStatsSummary } from '../services/statsService';

export function useStatsSummary(params = { from: null, to: null, status: 'final' }) {
  return useFetch(
    // useFetch가 asyncFn({ signal })로 호출하므로, options에 그대로 전달
    ({ signal }) => fetchStatsSummary(params, { signal }),
    [JSON.stringify(params || {})]
  );
}
