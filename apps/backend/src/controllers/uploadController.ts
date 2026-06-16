import { Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import { GolfClub } from '../models/GolfClub';

// ── uploads 디렉토리 보장 ─────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/holes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── multer 설정 ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `hole_${(req as AuthRequest).params.holeId}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드 가능합니다'));
    }
    cb(null, true);
  },
}).single('image');

// ── POST /golf-clubs/:clubId/holes/:holeId/image ──────────
export const uploadHoleImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다' });
    }

    const { clubId, holeId } = req.params;
    const imageUrl = `/uploads/holes/${req.file.filename}`;

    // 클럽 찾기 → 해당 hole 업데이트 → 저장
    const club = await GolfClub.findById(clubId);
    if (!club) {
      fs.unlinkSync(req.file.path); // 업로드된 파일 정리
      return res.status(404).json({ error: '골프장을 찾을 수 없습니다' });
    }

    let found = false;
    for (const course of club.nineCourses) {
      const hole = course.holes.find((h) => String(h._id) === holeId);
      if (hole) {
        // 기존 이미지 파일 삭제
        if (hole.imageUrl) {
          const oldPath = path.join(__dirname, '../../', hole.imageUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        hole.imageUrl = imageUrl;
        found = true;
        break;
      }
    }

    if (!found) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: '홀을 찾을 수 없습니다' });
    }

    await club.save();
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /golf-clubs/:clubId/holes/:holeId/image ────────
export const deleteHoleImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clubId, holeId } = req.params;

    const club = await GolfClub.findById(clubId);
    if (!club) return res.status(404).json({ error: '골프장을 찾을 수 없습니다' });

    let found = false;
    for (const course of club.nineCourses) {
      const hole = course.holes.find((h) => String(h._id) === holeId);
      if (hole) {
        if (hole.imageUrl) {
          const filePath = path.join(__dirname, '../../', hole.imageUrl);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          hole.imageUrl = undefined;
        }
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: '홀을 찾을 수 없습니다' });

    await club.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
