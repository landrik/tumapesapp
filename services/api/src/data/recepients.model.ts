import { Schema, model, Document } from 'mongoose';

export type DeliveryMethod = 'bank_transfer' | 'mobile_money' | 'cash_pickup';

export interface Recipient extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  country: string;
  currency: string;
  phone: string | null;
  deliveryMethod: DeliveryMethod;
  createdAt: string;
  updatedAt: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  ifscCode?: string | null;
  sortCode?: string | null;
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
  cashPickupNetwork?: string | null;
}

const RecipientSchema = new Schema<Recipient>(
  {
    userId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickname: { type: String, default: null },
    country: { type: String, required: true },
    currency: { type: String, required: true },
    phone: { type: String, default: null },
    deliveryMethod: {
      type: String,
      enum: ['bank_transfer', 'mobile_money', 'cash_pickup'],
      required: true,
    },
    bankName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    accountName: { type: String, default: null },
    ifscCode: { type: String, default: null },
    sortCode: { type: String, default: null },
    mobileMoneyProvider: { type: String, default: null },
    mobileMoneyNumber: { type: String, default: null },
    cashPickupNetwork: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default model<Recipient>('Recipient', RecipientSchema);
