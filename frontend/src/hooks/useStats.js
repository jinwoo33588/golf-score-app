// src/hooks/useStats.js
import { useEffect, useState } from 'react';
import * as statsAPI from '../services/statsService';

export default function useStats() {
  const [summary, setSummary] = useState(null);
  const [byCourse, setByCourse] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, c, t] = await Promise.all([
          statsAPI.getSummary(),
          statsAPI.getByCourse(),
          statsAPI.getTrend(),
        ]);
        setSummary(s);
        setByCourse(c);
        setTrend(t);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { summary, byCourse, trend, loading, error };
}
