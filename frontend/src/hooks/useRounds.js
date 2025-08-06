import { useState, useEffect } from 'react';
import * as roundService from '../services/roundService';

export default function useRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRounds = async () => {
    setLoading(true);
    try {
      const data = await roundService.getRounds();
      setRounds(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addRound = async (payload) => {
    setLoading(true);
    try {
      const newRound = await roundService.createRound(payload);
      setRounds(prev => [newRound, ...prev]);
      return newRound;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRound = async (id, payload) => {
    setLoading(true);
    try {
      const updated = await roundService.updateRound(id, payload);
      setRounds(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRound = async (id) => {
    setLoading(true);
    try {
      await roundService.deleteRound(id);
      setRounds(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  return { rounds, loading, error, fetchRounds, addRound, updateRound, deleteRound };
}