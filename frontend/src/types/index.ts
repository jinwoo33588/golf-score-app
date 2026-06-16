// ────────────────────────────────────────────────
// Shared primitives
// ────────────────────────────────────────────────

export type DistanceUnit = 'meter' | 'yard';
export type Par = 3 | 4 | 5;
export type CourseLabel = 'front' | 'back';

// ────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────

export interface User {
  _id: string;
  nickname: string;
  email: string;
  distanceUnit: DistanceUnit;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────
// GolfClub — 원본 골프장 데이터
// ────────────────────────────────────────────────

export interface TeeDistance {
  teeName: string;
  distance: number;
  unit: DistanceUnit;
}

export interface CourseHole {
  _id?: string;
  holeNumber: number;     // 해당 9홀 코스 기준 1~9
  par: Par;
  handicapIndex?: number;
  teeDistances: TeeDistance[];
  memo?: string;
  imageUrl?: string;
}

export interface NineCourse {
  _id?: string;
  name: string;
  order?: number;
  holeCount: number;
  parTotal: number;
  holes: CourseHole[];
  memo?: string;
}

export interface GolfClub {
  _id: string;
  name: string;
  region?: string;
  address?: string;
  nineCourses: NineCourse[];
  createdBy?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────
// Round — 사용자 라운드 기록
// ────────────────────────────────────────────────

export interface GolfClubSnapshot {
  golfClubName: string;
  region?: string;
}

export interface PlayedCourse {
  nineCourseId: string;
  name: string;
  order: 1 | 2;
  label: CourseLabel;
  parTotal: number;
}

export interface RoundHoleSnapshot {
  par: Par;
  distance?: number;
  handicapIndex?: number;
}

export interface RoundHole {
  roundHoleNumber: number;    // 라운드 기준 1~18
  nineCourseId: string;
  nineCourseName: string;
  courseHoleId?: string;
  courseHoleNumber: number;   // 해당 9홀 코스 기준 1~9
  courseHoleSnapshot: RoundHoleSnapshot;
  score: number;
  putts: number;
  fir: boolean | null;        // Par 3은 null
  gir: boolean | null;
  penalties: number;
  memo?: string;
}

export interface RoundSummary {
  totalScore: number;
  totalPar: number;
  overPar: number;
  totalPutts: number;
  firHit: number;
  firEligible: number;
  firRate: number;
  girHit: number;
  girRate: number;
  totalPenalties: number;
  frontNineScore: number;
  backNineScore: number;
  frontNinePar: number;
  backNinePar: number;
  birdiesOrBetter: number;
  pars: number;
  bogeys: number;
  doubleBogeyOrWorse: number;
  threePutts: number;
  scrambleHit: number;
  scrambleEligible: number;
  scrambleRate: number;
}

export interface Round {
  _id: string;
  userId: string;
  golfClubId: string;
  golfClubSnapshot: GolfClubSnapshot;
  playedCourses: PlayedCourse[];
  date: string;        // "YYYY-MM-DD"
  teeName: string;
  weather?: string;
  memo?: string;
  holes: RoundHole[];
  summary: RoundSummary;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────
// DTO — 라운드 생성 요청 (프론트 → 백엔드)
// ────────────────────────────────────────────────

export interface CreateRoundHoleRecord {
  roundHoleNumber: number;
  score: number;
  putts: number;
  fir: boolean | null;
  gir: boolean | null;
  penalties: number;
  memo?: string;
}

export interface CreateRoundRequest {
  golfClubId: string;
  frontNineCourseId: string;
  backNineCourseId: string;
  date: string;
  teeName: string;
  weather?: string;
  memo?: string;
  holeRecords: CreateRoundHoleRecord[];
}
