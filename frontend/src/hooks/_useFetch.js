// src/hooks/_useFetch.js
import { useEffect, useRef, useState } from 'react';

export default function useFetch(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await asyncFn({ signal: controller.signal });
        if (!alive) return;
        setData(res);
      } catch (e) {
        if (!alive) return;
        // axios는 AbortController 시그널로 취소 시 e.name === 'CanceledError'일 수 있음
        if (e.name === 'CanceledError') return;
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, err };
}
