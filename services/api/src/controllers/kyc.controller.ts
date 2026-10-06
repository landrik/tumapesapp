import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserModel from '../data/user.model';
import KycModel from '../data/kyc.model';
import { success, error } from '../utils/response';

interface SubmitKycBody {
  documentType: string;
}

// multer-gridfs-storage attaches an `id` (ObjectId) to each stored file
interface GridFsFile extends Express.Multer.File {
  id: mongoose.Types.ObjectId;
}

interface KycFiles {
  frontImage?: GridFsFile[];
  backImage?: GridFsFile[];
  selfie?: GridFsFile[];
}

interface KycStatusResponse {
  status: string;
  verifiedAt?: string | null;
  submittedAt?: string | null;
  estimatedReview?: string;
  rejectedAt?: string | null;
  reason?: string;
}

// POST /v1/kyc/submit  (multipart/form-data)
const submitKyc = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

  const { documentType } = req.body as SubmitKycBody;
  if (!documentType) {
    return error(res, 'documentType is required', 400, 'VALIDATION_ERROR');
  }

  // frontImage is required; backImage and selfie are optional
  const files = (req.files || {}) as KycFiles;
  if (!files.frontImage || files.frontImage.length === 0) {
    return error(res, 'frontImage is required', 400, 'VALIDATION_ERROR');
  }

  const submittedAt = new Date().toISOString();

  const kyc = await KycModel.findOneAndUpdate(
    { userId: req.user.id },
    {
      userId: req.user.id,
      documentType,
      frontImageId: files.frontImage[0].id,
      backImageId: files.backImage?.[0]?.id || null,
      selfieId: files.selfie?.[0]?.id || null,
      kycStatus: 'pending',
      kycSubmittedAt: submittedAt,
    },
    { upsert: true, new: true }
  );

  return success(res, {
    status: kyc.kycStatus,
    submittedAt: kyc.kycSubmittedAt,
    estimatedReview: '24 hours',
    documentType: kyc.documentType,
    message: 'Your documents have been received and are under review.',
  });
};

// GET /v1/kyc/status
const getKycStatus = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

  const kyc = await KycModel.findOne({ userId: req.user.id });
  if (!kyc) return success(res, { status: 'unverified' });

  const response: KycStatusResponse = { status: kyc.kycStatus };

  if (kyc.kycStatus === 'verified') {
    response.verifiedAt = kyc.kycVerifiedAt;
  }
  if (kyc.kycStatus === 'pending') {
    response.submittedAt = kyc.kycSubmittedAt;
    response.estimatedReview = '24 hours';
  }
  if (kyc.kycStatus === 'rejected') {
    response.rejectedAt = kyc.kycRejectedAt;
    response.reason = kyc.kycRejectionReason || 'Document could not be verified. Please resubmit.';
  }

  return success(res, response);
};

// GET /v1/kyc/document/:fileId  (stream a stored KYC image back out)
const getKycDocument = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return error(res, 'Invalid file id', 400, 'VALIDATION_ERROR');
  }

  const kyc = await KycModel.findOne({ userId: req.user.id });
  if (!kyc) return error(res, 'KYC record not found', 404, 'NOT_FOUND');

  const ownedIds = [kyc.frontImageId, kyc.backImageId, kyc.selfieId]
    .filter(Boolean)
    .map(id => id!.toString());

  if (!ownedIds.includes(fileId)) {
    return error(res, 'File not found', 404, 'NOT_FOUND');
  }

  const db = mongoose.connection.db;
  if (!db) {
    return error(res, 'Database connection is not ready', 503, 'DB_NOT_READY');
  }
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'kycUploads' });

  const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

  downloadStream.on('error', () => {
    error(res, 'File not found', 404, 'NOT_FOUND');
  });

  downloadStream.pipe(res);
};

export { submitKyc, getKycStatus, getKycDocument };
