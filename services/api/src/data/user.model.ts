import { Schema, model, Document } from 'mongoose';

export type DeliveryMethod = 'bank_transfer' | 'mobile_money';

export interface NotificationPrefs {
  transferUpdates: boolean;
  promotions: boolean;
  rateAlerts: boolean;
  pushEnabled: boolean;
}

export interface User extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  password: string;
  country: string;
  currency: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  pushToken?: string | null;
  notificationPrefs: NotificationPrefs;
  updatedAt: Date;
  createdAt: Date;
}

const NotificationPrefsSchema = new Schema<NotificationPrefs>(
  {
    transferUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    rateAlerts: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema<User>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  deliveryMethod: {
    type: String,
    enum: ['bank_transfer', 'mobile_money'],
    required: true,
  },
  mobileMoneyProvider: {
    type: String,
    required: function (this: User) {
      return this.deliveryMethod === 'mobile_money';
    },
  },
  mobileMoneyNumber: {
    type: String,
    required: function (this: User) {
      return this.deliveryMethod === 'mobile_money';
    },
  },
  pushToken: {
    type: String,
    default: null,
  },
  notificationPrefs: {
    type: NotificationPrefsSchema,
    default: () => ({
      transferUpdates: true,
      promotions: true,
      rateAlerts: true,
      pushEnabled: true,
    }),
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<User>('User', UserSchema);
