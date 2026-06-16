import { Request, Response, NextFunction } from 'express';
import { GolfClub } from '../models/GolfClub';
import { AuthRequest } from '../middleware/auth';

// GET /golfclubs?q=검색어&region=지역&page=1&limit=20
export const getGolfClubs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, region, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$text = { $search: String(q) };
    } else if (region) {
      filter.region = { $regex: String(region), $options: 'i' };
    }

    const [clubs, total] = await Promise.all([
      GolfClub.find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-nineCourses.holes.teeDistances -__v'), // 목록에선 홀 상세 제외
      GolfClub.countDocuments(filter),
    ]);

    return res.json({ clubs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// GET /golfclubs/:id  — 전체 데이터 (nineCourses + holes 포함)
export const getGolfClubById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const club = await GolfClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: '골프장을 찾을 수 없습니다.' });
    return res.json({ club });
  } catch (err) {
    next(err);
  }
};

// POST /golfclubs  (인증 필요)
export const createGolfClub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const club = await GolfClub.create({ ...req.body, createdBy: req.userId });
    return res.status(201).json({ club });
  } catch (err) {
    next(err);
  }
};

// PUT /golfclubs/:id  (인증 필요, 본인 또는 관리자)
export const updateGolfClub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const club = await GolfClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: '골프장을 찾을 수 없습니다.' });

    // public 골프장은 본인이 등록한 경우만 수정 허용
    if (club.createdBy && String(club.createdBy) !== String(req.userId))
      return res.status(403).json({ message: '수정 권한이 없습니다.' });

    Object.assign(club, req.body);
    await club.save();
    return res.json({ club });
  } catch (err) {
    next(err);
  }
};

// DELETE /golfclubs/:id  (인증 필요, 본인)
export const deleteGolfClub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const club = await GolfClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: '골프장을 찾을 수 없습니다.' });

    if (String(club.createdBy) !== String(req.userId))
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });

    await club.deleteOne();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
