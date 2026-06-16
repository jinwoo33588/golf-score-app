import { Document, Types } from 'mongoose';

// ────────────────────────────────────────────────
// Shared primitives
// ────────────────────────────────────────────────

export type DistanceUnit = 'meter' | 'yard';
export type Par = 3 | 4 | 5;
export type CourseLabel = 'front' | 'back';

// ────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  nickname: string;
  email: string;
  passwordHash: string;
  distanceUnit: DistanceUnit;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ────────────────────────────────────────────────
// GolfClub — 원본 골프장 데이터
// ────────────────────────────────────────────────

export interface ITeeDistance {
  teeName: string;   // "Black" | "Blue" | "White" | "Red" 등
  distance: number;
  unit: DistanceUnit;
}

export interface ICourseHole {
  _id?: Types.ObjectId;
  holeNumber: number;        // 해당 9홀 코스 기준 1~9
  par: Par;
  handicapIndex?: number;    // 홀 난이도 순위
  teeDistances: ITeeDistance[];
  memo?: string;
  imageUrl?: string;
}

export interface INineCourse {
  _id?: Types.ObjectId;
  name: string;              // 예: 동코스, 서코스
  order?: number;
  holeCount: number;         // 기본 9
  parTotal: number;
  holes: ICourseHole[];
  memo?: string;
}

export interface IGolfClub extends Document {
  _id: Types.ObjectId;
  name: string;
  region?: string;
  address?: string;
  nineCourses: INineCourse[];
  createdBy?: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────
// Round — 사용자 라운드 기록
// ────────────────────────────────────────────────

// 라운드 당시 골프장 스냅샷
export interface IGolfClubSnapshot {
  golfClubName: string;
  region?: string;
}

// 실제 플레이한 전반/후반 코스 정보
export interface IPlayedCourse {
  nineCourseId: Types.ObjectId;
  name: string;
  order: 1 | 2;
  label: CourseLabel;
  parTotal: number;
}

// 라운드 당시 홀 스냅샷
export interface IRoundHoleSnapshot {
  par: Par;
  distance?: number;
  handicapIndex?: number;
}

// 홀별 기록
export interface IRoundHole {
  roundHoleNumber: number;      // 라운드 기준 1~18
  nineCourseId: Types.ObjectId;
  nineCourseName: string;
  courseHoleId?: Types.ObjectId;
  courseHoleNumber: number;     // 해당 9홀 코스 기준 1~9
  courseHoleSnapshot: IRoundHoleSnapshot;
  score: number;
  putts: number;
  fir: boolean | null;          // Par 3은 null
  gir: boolean;
  penalties: number;
  memo?: string;
}

// 라운드 요약 (pre-save 자동계산)
export interface IRoundSummary {
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

export interface IRound extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  golfClubId: Types.ObjectId;
  golfClubSnapshot: IGolfClubSnapshot;
  playedCourses: IPlayedCourse[];
  date: string;              // "YYYY-MM-DD"
  teeName: string;
  weather?: string;
  memo?: string;
  holes: IRoundHole[];
  summary: IRoundSummary;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────
// DTO — 라운드 생성 요청 (프론트 → 백엔드)
// ────────────────────────────────────────────────

export interface CreateRoundHoleRecord {
  roundHoleNumber: number;
  score: number;
  putts: number;
  fir: boolean | null;
  gir: boolean;
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
