import { Router } from 'express';
import { getRate, listCorridors } from '../controllers/rates.controller';

const router = Router();

router.get('/corridors', listCorridors);
router.get('/', getRate);

export default router;
