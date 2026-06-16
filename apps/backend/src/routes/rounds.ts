import { Router } from 'express';
import { getRounds, getRoundById, createRound, deleteRound } from '../controllers/roundController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // 라운드 전체 인증 필요

router.get('/',     getRounds);
router.get('/:id',  getRoundById);
router.post('/',    createRound);
router.delete('/:id', deleteRound);

export default router;
