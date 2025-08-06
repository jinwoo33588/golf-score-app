// src/services/statsService.js
import axios from './axiosInstance';

export const getClubStats = () =>
  axios.get('/stats/clubs').then(res => res.data);

export const getHoleStats = () =>
  axios.get('/stats/holes').then(res => res.data);

export const getCourseStats = () =>
  axios.get('/stats/courses').then(res => res.data);