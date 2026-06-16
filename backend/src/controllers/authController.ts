import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const signToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as import('jsonwebtoken').SignOptions['expiresIn'],
  });

// POST /auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nickname, email, password, distanceUnit } = req.body;

    if (!nickname || !email || !password)
      return res.status(400).json({ message: 'nickname, email, password는 필수입니다.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });

    const user = await User.create({
      nickname,
      email,
      passwordHash: password, // pre-save 훅에서 해싱
      distanceUnit: distanceUnit ?? 'meter',
    });

    const token = signToken(String(user._id));
    return res.status(201).json({ token, user: { _id: user._id, nickname: user.nickname, email: user.email, distanceUnit: user.distanceUnit } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email, password는 필수입니다.' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const token = signToken(String(user._id));
    return res.json({ token, user: { _id: user._id, nickname: user.nickname, email: user.email, distanceUnit: user.distanceUnit } });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me  (인증 필요)
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PATCH /auth/me  (인증 필요)
export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nickname, distanceUnit } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(nickname && { nickname }), ...(distanceUnit && { distanceUnit }) },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
