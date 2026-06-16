import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose, { Types } from 'mongoose';
import { User } from '../models/User';
import { GolfClub } from '../models/GolfClub';
import { Round } from '../models/Round';
import { IGolfClub, INineCourse } from '../types';

// ── 난수 유틸 ─────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── 18홀 스코어 생성 (목표 총점 기준) ─────────────────────
interface HoleInfo {
  par: 3 | 4 | 5;
  handicapIndex?: number;
  whiteDistance?: number;
  holeId: Types.ObjectId;
  holeNumber: number; // 코스 기준 1~9
}

function makeHoleScores(holes: HoleInfo[], targetTotal: number): {
  score: number; putts: number; fir: boolean | null; gir: boolean; penalties: number;
}[] {
  // 1단계: 모두 파로 시작
  const scores = holes.map((h) => ({ ...h, over: 0 }));
  let totalPar = holes.reduce((s, h) => s + h.par, 0);
  let needed = targetTotal - totalPar;

  // 2단계: bogey / double / triple 가중치로 배분
  const candidates = scores.map((_, i) => i);

  while (needed > 0) {
    const i = pick(candidates);
    const add = needed >= 3 && Math.random() < 0.08 ? 2
              : needed >= 2 && Math.random() < 0.2  ? 2
              : 1;
    scores[i].over += Math.min(add, needed);
    needed -= Math.min(add, needed);
  }

  // birdie 배분 (needed가 음수면)
  while (needed < 0) {
    const i = pick(candidates);
    if (scores[i].over > 0) {
      scores[i].over -= 1;
    } else {
      scores[i].over -= 1; // birdie
    }
    needed += 1;
  }

  return scores.map((h) => {
    const score = h.par + h.over;
    const gir = h.over <= 0 ? (Math.random() < 0.7) : (Math.random() < 0.25);
    const firEligible = h.par !== 3;
    const fir = firEligible
      ? (gir ? (Math.random() < 0.7) : (Math.random() < 0.35))
      : null;

    // 퍼트: GIR + 파 이하면 2퍼트 중심, bogey 이상이면 2~3퍼트
    const basePutts = gir
      ? (h.over <= 0 ? (Math.random() < 0.2 ? 1 : 2) : (Math.random() < 0.15 ? 3 : 2))
      : (h.over >= 2 ? (Math.random() < 0.4 ? 3 : 2) : 2);

    const penalties = (!fir && firEligible && h.over >= 2 && Math.random() < 0.4) ? 1 : 0;

    return { score, putts: basePutts, fir, gir, penalties };
  });
}

// ── 라운드 데이터 생성 ─────────────────────────────────────
interface RoundConfig {
  date: string;
  weather: string;
  teeName: string;
  targetScore: number;
  memo?: string;
  frontCourseIdx: number; // club.nineCourses 인덱스
  backCourseIdx: number;
}

const ROUND_CONFIGS: RoundConfig[] = [
  { date: '2025-11-02', weather: '맑음',    teeName: 'White', targetScore: 88, frontCourseIdx: 0, backCourseIdx: 1 },
  { date: '2025-11-15', weather: '흐림',    teeName: 'White', targetScore: 85, frontCourseIdx: 1, backCourseIdx: 0 },
  { date: '2025-11-29', weather: '맑음',    teeName: 'Blue',  targetScore: 92, frontCourseIdx: 0, backCourseIdx: 1, memo: '바람이 많이 불었음' },
  { date: '2025-12-07', weather: '흐림',    teeName: 'White', targetScore: 86, frontCourseIdx: 1, backCourseIdx: 2 },
  { date: '2026-01-11', weather: '맑음',    teeName: 'White', targetScore: 89, frontCourseIdx: 2, backCourseIdx: 0 },
  { date: '2026-01-25', weather: '눈',      teeName: 'White', targetScore: 94, frontCourseIdx: 0, backCourseIdx: 1, memo: '눈 내린 직후 코스, 어려웠음' },
  { date: '2026-02-08', weather: '맑음',    teeName: 'White', targetScore: 84, frontCourseIdx: 1, backCourseIdx: 2 },
  { date: '2026-02-22', weather: '흐림',    teeName: 'White', targetScore: 87, frontCourseIdx: 0, backCourseIdx: 2 },
  { date: '2026-03-08', weather: '맑음',    teeName: 'White', targetScore: 83, frontCourseIdx: 2, backCourseIdx: 1, memo: '드라이버 잘 맞은 날' },
  { date: '2026-03-22', weather: '흐림',    teeName: 'Blue',  targetScore: 90, frontCourseIdx: 0, backCourseIdx: 1 },
  { date: '2026-04-05', weather: '맑음',    teeName: 'White', targetScore: 82, frontCourseIdx: 1, backCourseIdx: 0, memo: '퍼팅 감 좋았던 날' },
  { date: '2026-04-19', weather: '비',      teeName: 'White', targetScore: 91, frontCourseIdx: 2, backCourseIdx: 0, memo: '우천 라운드' },
  { date: '2026-05-03', weather: '맑음',    teeName: 'White', targetScore: 85, frontCourseIdx: 0, backCourseIdx: 2 },
  { date: '2026-05-17', weather: '맑음',    teeName: 'Blue',  targetScore: 81, frontCourseIdx: 1, backCourseIdx: 2, memo: '시즌 베스트' },
  { date: '2026-05-31', weather: '흐림',    teeName: 'White', targetScore: 86, frontCourseIdx: 2, backCourseIdx: 1 },
];

// ── 메인 ─────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI가 설정되지 않았습니다');
  await mongoose.connect(uri);
  console.log('✅ MongoDB 연결됨');

  // 유저 조회 (없으면 생성)
  let user = await User.findOne();
  if (!user) {
    user = await new User({
      nickname: '테스트유저',
      email: 'test@golf.com',
      passwordHash: 'test1234!',
      distanceUnit: 'meter',
    }).save();
    console.log(`👤 테스트 유저 생성: ${user.email}`);
  } else {
    console.log(`👤 기존 유저 사용: ${user.email} (${user.nickname})`);
  }

  // 골프장 조회 (레이크사이드 — 3코스 보유)
  const clubDocs = await GolfClub.find({ isPublic: true });
  if (clubDocs.length === 0) {
    console.error('❌ 골프장 데이터가 없습니다. 먼저 npm run seed 실행해주세요.');
    process.exit(1);
  }

  // 3코스 이상인 골프장 우선 사용
  const club = (clubDocs.find((c) => c.nineCourses.length >= 3) ?? clubDocs[0]) as IGolfClub & { _id: Types.ObjectId; nineCourses: (INineCourse & { _id: Types.ObjectId })[] };

  // 최대 코스 인덱스 범위 조정
  const maxIdx = club.nineCourses.length - 1;

  // 기존 더미 라운드 삭제
  const deleted = await Round.deleteMany({ userId: user._id });
  console.log(`🗑️  기존 라운드 ${deleted.deletedCount}개 삭제`);

  let created = 0;
  for (const cfg of ROUND_CONFIGS) {
    const frontIdx = Math.min(cfg.frontCourseIdx, maxIdx);
    const backIdx  = Math.min(cfg.backCourseIdx,  maxIdx) === frontIdx
      ? (frontIdx + 1) % club.nineCourses.length
      : Math.min(cfg.backCourseIdx, maxIdx);

    const frontCourse = club.nineCourses[frontIdx];
    const backCourse  = club.nineCourses[backIdx];

    // 18홀 정보 구성
    const allHoles: HoleInfo[] = [
      ...frontCourse.holes.map((h) => ({
        par: h.par as 3 | 4 | 5,
        handicapIndex: h.handicapIndex,
        whiteDistance: h.teeDistances.find((t) => t.teeName === cfg.teeName)?.distance
          ?? h.teeDistances.find((t) => t.teeName === 'White')?.distance,
        holeId: h._id as unknown as Types.ObjectId,
        holeNumber: h.holeNumber,
      })),
      ...backCourse.holes.map((h) => ({
        par: h.par as 3 | 4 | 5,
        handicapIndex: h.handicapIndex,
        whiteDistance: h.teeDistances.find((t) => t.teeName === cfg.teeName)?.distance
          ?? h.teeDistances.find((t) => t.teeName === 'White')?.distance,
        holeId: h._id as unknown as Types.ObjectId,
        holeNumber: h.holeNumber,
      })),
    ];

    const holeStats = makeHoleScores(allHoles, cfg.targetScore);

    const holes = allHoles.map((h, i) => {
      const stat = holeStats[i];
      const courseId = i < 9 ? frontCourse._id : backCourse._id;
      const courseName = i < 9 ? frontCourse.name : backCourse.name;
      return {
        roundHoleNumber: i + 1,
        nineCourseId: courseId,
        nineCourseName: courseName,
        courseHoleId: h.holeId,
        courseHoleNumber: h.holeNumber,
        courseHoleSnapshot: {
          par: h.par,
          distance: h.whiteDistance,
          handicapIndex: h.handicapIndex,
        },
        score: stat.score,
        putts: stat.putts,
        fir: stat.fir,
        gir: stat.gir,
        penalties: stat.penalties,
      };
    });

    const frontParTotal = frontCourse.holes.reduce((s, h) => s + h.par, 0);
    const backParTotal  = backCourse.holes.reduce((s, h) => s + h.par, 0);

    const dummySummary = {
      totalScore: 0, totalPar: 0, overPar: 0, totalPutts: 0,
      firHit: 0, firEligible: 0, firRate: 0,
      girHit: 0, girRate: 0, totalPenalties: 0,
      frontNineScore: 0, backNineScore: 0, frontNinePar: 0, backNinePar: 0,
      birdiesOrBetter: 0, pars: 0, bogeys: 0, doubleBogeyOrWorse: 0, threePutts: 0,
      scrambleHit: 0, scrambleEligible: 0, scrambleRate: 0,
    };

    const round = new Round({
      userId: user._id,
      golfClubId: club._id,
      golfClubSnapshot: { golfClubName: club.name, region: club.region },
      playedCourses: [
        { nineCourseId: frontCourse._id, name: frontCourse.name, order: 1, label: 'front', parTotal: frontParTotal },
        { nineCourseId: backCourse._id,  name: backCourse.name,  order: 2, label: 'back',  parTotal: backParTotal  },
      ],
      date: cfg.date,
      teeName: cfg.teeName,
      weather: cfg.weather,
      memo: cfg.memo,
      holes,
      summary: dummySummary, // pre-save hook이 실제 값으로 덮어씀
    });

    await round.save(); // pre-save가 summary 자동 계산
    const total = holes.reduce((s, h) => s + h.score, 0);
    console.log(`  ✅ ${cfg.date}  ${frontCourse.name}+${backCourse.name}  ${total}타 (목표 ${cfg.targetScore})  날씨:${cfg.weather}`);
    created++;
  }

  console.log(`\n⛳ 라운드 ${created}개 생성 완료 (유저: ${user.nickname})`);
  await mongoose.disconnect();
  console.log('✅ 완료');
}

seed().catch((err) => {
  console.error('❌ 시드 실패:', err);
  process.exit(1);
});
