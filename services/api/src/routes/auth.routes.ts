import { Router } from 'express';
import { register, login, logout, refresh, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/reset-password', resetPassword);

export default router;
