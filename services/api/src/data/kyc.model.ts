import { Schema, model, Document, Types } from 'mongoose';

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Kyc extends Document {
  userId: string;
  documentType: string;
  frontImageId: Types.ObjectId;
  backImageId?: Types.ObjectId | null;
  selfieId?: Types.ObjectId | null;
  kycStatus: KycStatus;
  kycSubmittedAt: string | null;
  kycVerifiedAt: string | null;
  kycRejectedAt: string | null;
  kycRejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const KycSchema = new Schema<Kyc>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    frontImageId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    backImageId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    selfieId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      required: true,
      default: 'unverified',
    },
    kycSubmittedAt: {
      type: String,
      default: null,
    },
    kycVerifiedAt: {
      type: String,
      default: null,
    },
    kycRejectedAt: {
      type: String,
      default: null,
    },
    kycRejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default model<Kyc>('Kyc', KycSchema);
