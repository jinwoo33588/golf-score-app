import { Router } from 'express';
import {
  getGolfClubs,
  getGolfClubById,
  createGolfClub,
  updateGolfClub,
  deleteGolfClub,
} from '../controllers/golfClubController';
import {
  uploadMiddleware,
  uploadHoleImage,
  deleteHoleImage,
} from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/',     getGolfClubs);
router.get('/:id',  getGolfClubById);
router.post('/',    authenticate, createGolfClub);
router.put('/:id',  authenticate, updateGolfClub);
router.delete('/:id', authenticate, deleteGolfClub);

// 홀 이미지 업로드 / 삭제
router.post('/:clubId/holes/:holeId/image',   authenticate, uploadMiddleware, uploadHoleImage);
router.delete('/:clubId/holes/:holeId/image', authenticate, deleteHoleImage);

export default router;
