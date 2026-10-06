import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getMe,
  updateMe,
  savePushToken,
  getNotificationPrefs,
  updateNotificationPrefs,
} from '../controllers/users.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/push-token', savePushToken);
router.get('/notification-prefs', getNotificationPrefs);
router.patch('/notification-prefs', updateNotificationPrefs);

export default router;
