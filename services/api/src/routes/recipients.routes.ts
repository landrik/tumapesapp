import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from '../controllers/recipients.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listRecipients);
router.post('/', createRecipient);
router.patch('/:id', updateRecipient);
router.delete('/:id', deleteRecipient);

export default router;
