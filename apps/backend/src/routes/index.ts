import { Router } from 'express';
import authRouter      from './auth';
import golfClubRouter  from './golfClubs';
import roundRouter     from './rounds';

const router = Router();

router.use('/auth',       authRouter);
router.use('/golfclubs',  golfClubRouter);
router.use('/rounds',     roundRouter);

export default router;
