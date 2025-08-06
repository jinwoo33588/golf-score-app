import { useState, useEffect } from 'react';
import * as roundService from '../services/roundService';

export default function useRoundDetail(roundId) {
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roundId) return;
    setLoading(true);
    roundService.getRoundDetail(roundId)
      .then(data => setRound(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [roundId]);

  const deleteRound = async () => {
    setLoading(true);
    try {
      await roundService.deleteRound(roundId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { round, loading, error, deleteRound };
}