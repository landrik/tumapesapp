import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import kycRoutes from './kyc.routes';
import ratesRoutes from './rates.routes';
import countriesRoutes from './countries.routes';
import recipientsRoutes from './recipients.routes';
import transfersRoutes from './transfers.routes';
import { success } from '../utils/response';

const router = Router();

// GET /v1 — quick sanity check listing what's actually mounted here,
// instead of falling through to a bare 404.
router.get('/', (req: Request, res: Response) => {
  return success(res, {
    message: 'TumaPesa mock API',
    endpoints: {
      auth: '/v1/auth',
      users: '/v1/users',
      kyc: '/v1/kyc',
      rates: '/v1/rates',
      countries: '/v1/countries',
      recipients: '/v1/recipients',
      transfers: '/v1/transfers',
    },
    health: '/health',
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/kyc', kycRoutes);
router.use('/rates', ratesRoutes);
router.use('/countries', countriesRoutes);
router.use('/recipients', recipientsRoutes);
router.use('/transfers', transfersRoutes);

export default router;
