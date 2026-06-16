import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { GolfClub } from '../models/GolfClub';
import { Round } from '../models/Round';
import { AuthRequest } from '../middleware/auth';
import { CreateRoundRequest, IRoundHole, IPlayedCourse, IGolfClub } from '../types';

// ── 라운드 생성 헬퍼 ──────────────────────────────────────
function buildRoundHoles(
  golfClub: IGolfClub | null,
  req: CreateRoundRequest
): IRoundHole[] {
  if (!golfClub) throw new Error('골프장을 찾을 수 없습니다.');

  const frontCourse = golfClub.nineCourses.find(
    (c) => String(c._id) === req.frontNineCourseId
  );
  const backCourse = golfClub.nineCourses.find(
    (c) => String(c._id) === req.backNineCourseId
  );

  if (!frontCourse) throw Object.assign(new Error('전반 코스를 찾을 수 없습니다.'), { statusCode: 400 });
  if (!backCourse)  throw Object.assign(new Error('후반 코스를 찾을 수 없습니다.'), { statusCode: 400 });

  const courseMap = [
    { course: frontCourse, offset: 0 },
    { course: backCourse,  offset: 9 },
  ];

  const holes: IRoundHole[] = [];

  for (const { course, offset } of courseMap) {
    for (let i = 0; i < 9; i++) {
      const roundHoleNumber = offset + i + 1;
      const courseHole = course.holes[i];
      const record = req.holeRecords.find((r) => r.roundHoleNumber === roundHoleNumber);

      if (!record)
        throw Object.assign(
          new Error(`roundHoleNumber ${roundHoleNumber} 기록이 없습니다.`),
          { statusCode: 400 }
        );

      // Par 3에서 fir는 null이어야 함
      if (courseHole.par === 3 && record.fir !== null)
        throw Object.assign(
          new Error(`${roundHoleNumber}번 홀(Par 3)의 fir는 null이어야 합니다.`),
          { statusCode: 400 }
        );

      // 선택된 티박스 거리 찾기
      const teeEntry = courseHole.teeDistances.find(
        (t) => t.teeName.toLowerCase() === req.teeName.toLowerCase()
      );

      holes.push({
        roundHoleNumber,
        nineCourseId: course._id as Types.ObjectId,
        nineCourseName: course.name,
        courseHoleId: courseHole._id as Types.ObjectId | undefined,
        courseHoleNumber: courseHole.holeNumber,
        courseHoleSnapshot: {
          par: courseHole.par,
          distance: teeEntry?.distance,
          handicapIndex: courseHole.handicapIndex,
        },
        score:     record.score,
        putts:     record.putts,
        fir:       record.fir,
        gir:       record.gir,
        penalties: record.penalties,
        memo:      record.memo,
      });
    }
  }

  return holes;
}

// GET /rounds?page=1&limit=20&golfClubId=...&year=2025
export const getRounds = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', golfClubId, year } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = { userId: req.userId };
    if (golfClubId) filter.golfClubId = golfClubId;
    if (year) filter.date = { $gte: `${year}-01-01`, $lte: `${year}-12-31` };

    // 해당 유저의 라운드가 존재하는 연도 목록
    const allDates = await Round.find({ userId: req.userId }).select('date').lean();
    const years = [...new Set(allDates.map((r) => r.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));

    const [rounds, total] = await Promise.all([
      Round.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-holes -__v'),
      Round.countDocuments(filter),
    ]);

    return res.json({ rounds, total, page: Number(page), limit: Number(limit), years });
  } catch (err) {
    next(err);
  }
};

// GET /rounds/:id
export const getRoundById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const round = await Round.findOne({ _id: req.params.id, userId: req.userId });
    if (!round) return res.status(404).json({ message: '라운드를 찾을 수 없습니다.' });
    return res.json({ round });
  } catch (err) {
    next(err);
  }
};

// POST /rounds
export const createRound = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CreateRoundRequest;

    if (!body.golfClubId || !body.frontNineCourseId || !body.backNineCourseId)
      return res.status(400).json({ message: 'golfClubId, frontNineCourseId, backNineCourseId는 필수입니다.' });

    if (!Array.isArray(body.holeRecords) || body.holeRecords.length !== 18)
      return res.status(400).json({ message: 'holeRecords는 18개여야 합니다.' });

    const golfClub = await GolfClub.findById(body.golfClubId);
    if (!golfClub) return res.status(404).json({ message: '골프장을 찾을 수 없습니다.' });

    const frontCourse = golfClub.nineCourses.find((c) => String(c._id) === body.frontNineCourseId)!;
    const backCourse  = golfClub.nineCourses.find((c) => String(c._id) === body.backNineCourseId)!;

    const playedCourses: IPlayedCourse[] = [
      { nineCourseId: frontCourse._id as Types.ObjectId, name: frontCourse.name, order: 1, label: 'front', parTotal: frontCourse.parTotal },
      { nineCourseId: backCourse._id as Types.ObjectId,  name: backCourse.name,  order: 2, label: 'back',  parTotal: backCourse.parTotal  },
    ];

    const holes = buildRoundHoles(golfClub, body);

    const round = await Round.create({
      userId: req.userId,
      golfClubId: golfClub._id,
      golfClubSnapshot: { golfClubName: golfClub.name, region: golfClub.region },
      playedCourses,
      date:    body.date,
      teeName: body.teeName,
      weather: body.weather,
      memo:    body.memo,
      holes,
      summary: {}, // pre-save 훅에서 덮어씀
    });

    return res.status(201).json({ round });
  } catch (err) {
    next(err);
  }
};

// DELETE /rounds/:id
export const deleteRound = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const round = await Round.findOne({ _id: req.params.id, userId: req.userId });
    if (!round) return res.status(404).json({ message: '라운드를 찾을 수 없습니다.' });
    await round.deleteOne();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
