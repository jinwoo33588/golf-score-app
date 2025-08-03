// src/types/index.ts
export interface User {
  id: number;
  name: string;
  login_id: string;
}

export interface Round {
  id: number;
  user_id: number;
  course_name: string;
  date: string;         // YYYY-MM-DD
  total_score?: number;
}

export interface Hole {
  id: number;
  round_id: number;
  hole_number: number;
  par: number;
  distance?: number;
  score?: number;
  teeshot?: 'fairway'|'rough'|'penalty';
  approach?: string;
  putts?: number;
}

export interface Shot {
  id: number;
  hole_id: number;
  type: 'tee'|'iron'|'approach'|'putt';
  club?: string;
  result?: string;
}
