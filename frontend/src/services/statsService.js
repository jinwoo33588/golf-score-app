// src/services/statsService.js
import axios from './axiosInstance'; 

export const getSummary = () =>
  axios.get('/stats/summary').then(res => res.data);

export const getByCourse = () =>
  axios.get('/stats/by-course').then(res => res.data);

export const getTrend = () =>
  axios.get('/stats/trend').then(res => res.data);
