import { Schema, model, Document } from 'mongoose';

export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface RecipientSnapshot {
  firstName: string;
  lastName: string;
  country: string;
  deliveryMethod: string;
}

export interface Transfer extends Document {
  userId: string;
  reference: string;
  status: TransferStatus;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  rate: number;
  fee: number;
  totalDebit: number;
  recipientId: string;
  recipientSnapshot: RecipientSnapshot;
  deliveryMethod: string;
  estimatedDelivery: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const RecipientSnapshotSchema = new Schema<RecipientSnapshot>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    deliveryMethod: { type: String, required: true },
  },
  { _id: false }
);

const TransferSchema = new Schema<Transfer>(
  {
    userId: { type: String, required: true, index: true },
    reference: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      required: true,
      default: 'pending',
    },
    sendAmount: { type: Number, required: true },
    sendCurrency: { type: String, required: true },
    receiveAmount: { type: Number, required: true },
    receiveCurrency: { type: String, required: true },
    rate: { type: Number, required: true },
    fee: { type: Number, required: true },
    totalDebit: { type: Number, required: true },
    recipientId: { type: String, required: true },
    recipientSnapshot: { type: RecipientSnapshotSchema, required: true },
    deliveryMethod: { type: String, required: true },
    estimatedDelivery: { type: String, required: true },
    completedAt: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default model<Transfer>('Transfer', TransferSchema);
