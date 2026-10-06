import { Router } from 'express';
import { listCountries } from '../controllers/countries.controller';

const router = Router();

router.get('/', listCountries);

export default router;
