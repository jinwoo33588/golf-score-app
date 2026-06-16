/**
 * 골프장 데이터 공유 타입
 * 각 골프장 index.ts 에서 ClubData 타입으로 데이터를 정의합니다.
 */

export interface TeeData {
  teeName: 'Black' | 'Blue' | 'White' | 'Gold' | 'Silver' | 'Red';
  distance: number; // 미터
}

export interface HoleData {
  par: 3 | 4 | 5;
  handicapIndex?: number;
  tees?: TeeData[];
  memo?: string;
}

export interface CourseData {
  name: string;
  order: number;
  memo?: string;
  holes: HoleData[]; // 9개, 인덱스 0 = 1번 홀
}

export interface ClubData {
  name: string;
  region?: string;
  address?: string;
  isPublic?: boolean;
  nineCourses: CourseData[];
}
