import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import kycUpload from '../config/multer.config';
import { submitKyc, getKycStatus, getKycDocument } from '../controllers/kyc.controller';

const router = Router();

router.use(requireAuth);

router.post(
  '/submit',
  kycUpload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  submitKyc
);
router.get('/status', getKycStatus);
router.get('/document/:fileId', getKycDocument);

export default router;
