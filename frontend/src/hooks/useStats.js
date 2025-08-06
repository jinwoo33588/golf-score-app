// src/hooks/useStats.js
import { useState, useEffect } from 'react';
import * as statsService from '../services/statsService';

export default function useStats() {
  const [clubStats, setClubStats] = useState([]);
  const [holeStats, setHoleStats] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [clubs, holes, courses] = await Promise.all([
        statsService.getClubStats(),
        statsService.getHoleStats(),
        statsService.getCourseStats(),
      ]);
      setClubStats(clubs);
      setHoleStats(holes);
      setCourseStats(courses);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { clubStats, holeStats, courseStats, loading, error, fetchStats };
}