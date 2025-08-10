import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoleStepForm from '../components/round/HoleStepForm';
import FullRoundForm from '../components/round/FullRoundForm';
import axios from '../services/axiosInstance';

const courseData = {
  '아시아나CC': [4, 5, 4, 3, 4, 3, 5, 3, 4, 4, 4, 5, 3, 4, 4, 5, 3, 4],
  '레이크우드CC': [4, 4, 5, 3, 4, 3, 4, 5, 4, 4, 5, 3, 4, 4, 4, 5, 3, 4],
};

const generateInitialData = (courseName) => {
  const parArray = courseData[courseName] || Array(18).fill(4);
  return parArray.map((par, i) => ({
    hole:       i + 1,
    par,
    score:      '',
    teeshot:    '',
    approach:   '',
    putts:      '',
    gir:        false,
    fw_hit:     false,
    penalties:  0
  }));
};

export default function RoundFormPage(){
  const { roundId } = useParams();
  const isEdit     = Boolean(roundId);
  const navigate   = useNavigate();

  const [viewMode, setViewMode]   = useState('full');
  const [course, setCourse]       = useState('');
  const [date, setDate]           = useState('');
  const [roundData, setRoundData] = useState([]);

}