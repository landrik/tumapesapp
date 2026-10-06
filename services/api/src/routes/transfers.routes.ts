import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createTransfer,
  confirmTransfer,
  getTransfer,
  listTransfers,
  cancelTransfer,
} from '../controllers/transfers.controller';

const router = Router();

router.use(requireAuth);

router.post('/', createTransfer);
router.get('/', listTransfers);
router.get('/:id', getTransfer);
router.post('/:id/confirm', confirmTransfer);
router.delete('/:id', cancelTransfer);

export default router;
