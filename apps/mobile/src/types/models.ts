import { RecipientDeliveryMethod } from '../constants/deliveryMethods';

// --- Shared API envelope (matches src/utils/response.ts on the backend) ---
export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
}

// --- User ---
export type UserDeliveryMethod = 'bank_transfer' | 'mobile_money';

export interface NotificationPrefs {
  transferUpdates: boolean;
  promotions: boolean;
  rateAlerts: boolean;
  pushEnabled: boolean;
}

// Returned by GET/PATCH /v1/users/me — password is always stripped server-side.
export interface UserProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  country: string;
  currency: string;
  phone: string;
  deliveryMethod: UserDeliveryMethod;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  pushToken?: string | null;
  notificationPrefs: NotificationPrefs;
  createdAt: string;
  updatedAt: string;
}

// Returned by POST /v1/auth/login and /v1/auth/register — includes a KYC
// snapshot alongside the profile fields (see auth.controller.ts's
// buildUserResponse). Note this KYC snapshot is NOT present on the plain
// UserProfile returned from GET /v1/users/me, since that endpoint doesn't
// join against the Kyc collection.
export interface AuthUser extends UserProfile {
  kycStatus: KycStatus;
  kycVerifiedAt: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// --- KYC ---
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface KycStatusResponse {
  status: KycStatus;
  verifiedAt?: string | null;
  submittedAt?: string | null;
  estimatedReview?: string;
  rejectedAt?: string | null;
  reason?: string;
}

export interface KycSubmitResponse {
  status: KycStatus;
  submittedAt: string;
  estimatedReview: string;
  documentType: string;
  message: string;
}

export type KycDocumentType = 'passport' | 'driving_licence' | 'national_id';

// --- Recipients ---
export interface Recipient {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  country: string;
  currency: string;
  phone: string | null;
  deliveryMethod: RecipientDeliveryMethod;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  ifscCode?: string | null;
  sortCode?: string | null;
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
  cashPickupNetwork?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipientPayload {
  firstName: string;
  lastName: string;
  nickname?: string;
  country: string;
  phone?: string;
  deliveryMethod: RecipientDeliveryMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  ifscCode?: string;
  sortCode?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  cashPickupNetwork?: string;
}

export type UpdateRecipientPayload = Partial<
  Omit<CreateRecipientPayload, 'deliveryMethod' | 'country'>
>;

// --- Countries ---
export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  callingCode: string; // international dialing code, no leading '+'
}

// --- Rates ---
export interface Corridor {
  from: string;
  to: string;
  fee: number;
  estimatedDelivery: string;
}

export interface RateQuote extends Corridor {
  rate: number;
  updatedAt: string;
  /** Whether the rate came from the live FX provider or the static
   * fallback (used if the provider is unreachable). */
  rateSource?: 'live' | 'fallback';
}

// --- Transfers ---
export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface RecipientSnapshot {
  firstName: string;
  lastName: string;
  country: string;
  deliveryMethod: string;
}

export interface Transfer {
  _id: string;
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

export interface CreateTransferPayload {
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: string;
  recipientId: string;
  deliveryMethod: string;
}

export interface TransferListResponse {
  items: Transfer[];
  total: number;
  page: number;
  limit: number;
}
